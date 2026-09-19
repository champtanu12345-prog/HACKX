"""Maritime Investigation Orchestrator Service for HACKX.

Integrates all 14 stages of the oil spill attribution intelligence workflow:
1. Select demo scenario
2. Load satellite observation
3. Run oil spill detection (U-Net segmentation)
4. Extract spill geometry
5. Run drift hindcast (Lagrangian backward simulation)
6. Estimate spill origin
7. Run drift forecast (forward simulation)
8. Query nearby AIS vessels
9. Analyze vessel behavior (anomalies, AIS silence gaps, speed drops)
10. Calculate vessel correlation scores (transparent explainable formula)
11. Rank candidate vessels
12. Generate structured evidence and human explanations
13. Generate chronological investigation timeline
14. Persist and return complete Investigation dossier
"""

from datetime import datetime, timedelta
import json
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.data.scenarios import DEMO_SCENARIOS_DATA
from backend.services.providers.ais import DemoAISProvider
from backend.services.drift.drift_service import drift_service
from backend.services.correlation_engine import correlation_engine
from ml.inference.pipeline import detect_oil_spill
from backend.models.investigation import Investigation
from backend.models.spill import SpillDetection
from backend.repositories.investigation_repo import investigation_repo


class InvestigationOrchestrator:
    """End-to-end intelligence orchestrator uniting satellite, drift, AIS, and scoring subsystems."""

    def __init__(self):
        self.ais_provider = DemoAISProvider()

    def run_investigation(
        self,
        scenario_id: str = "scenario_a",
        db: Optional[Session] = None,
        model_mode: str = "demo",
        save_to_db: bool = True,
    ) -> Dict[str, Any]:
        """Executes the complete 14-step investigation workflow deterministically."""
        scenario_id = scenario_id.lower()
        scenario_info = DEMO_SCENARIOS_DATA.get(scenario_id, DEMO_SCENARIOS_DATA["scenario_a"])

        start_time_iso = datetime.utcnow().isoformat() + "Z"

        # 1. Load Satellite Observation
        sat_obs = scenario_info.get("satellite_observation", {
            "satellite_name": "Sentinel-1A",
            "sensor_type": "C-SAR IW (Interferometric Wide)",
            "acquisition_time": "2026-09-14T01:28:45Z",
            "scene_id": f"S1A_IW_GRDH_{scenario_id.upper()}",
            "resolution_meters": 10.0,
            "geographic_bounds": [71.5, 18.2, 73.1, 19.8],
        })

        # 2. Run Oil Spill Detection & 3. Extract Spill Geometry
        detection_res = detect_oil_spill(scenario_id=scenario_id, mode=model_mode)
        spill_payload = {
            "id": detection_res.detection_id,
            "area_sqkm": detection_res.area_sqkm,
            "perimeter_km": detection_res.perimeter_km,
            "confidence": detection_res.confidence,
            "centroid": list(detection_res.centroid),  # [lat, lon]
            "geometry": detection_res.polygon,
            "estimated_age_hours": detection_res.estimated_age_hours,
            "detection_time": sat_obs.get("acquisition_time", "2026-09-14T01:28:45Z"),
            "satellite_name": sat_obs.get("satellite_name", "Sentinel-1A"),
            "sensor_type": sat_obs.get("sensor_type", "C-SAR IW"),
            "scene_id": sat_obs.get("scene_id", ""),
            "mask_image": detection_res.mask_image,
            "overlay_image": detection_res.overlay_image,
        }

        # 4. Run Drift Hindcast (backward simulation)
        hindcast_res = drift_service.simulate_for_scenario(
            scenario_id=scenario_id,
            run_type="HINDCAST",
        )
        hindcast_points = [
            {
                "step": p.timestep_index,
                "time": p.timestamp.isoformat() + "Z" if isinstance(p.timestamp, datetime) else str(p.timestamp),
                "lat": p.latitude,
                "lon": p.longitude,
                "velocity": p.velocity,
                "direction": p.direction,
                "uncertainty_radius_m": p.uncertainty_radius_m,
            }
            for p in hindcast_res.trajectory_points
        ]

        # 5. Estimate Spill Origin
        sc_drift = scenario_info.get("drift_simulation", {})
        if sc_drift.get("estimated_origin_lat") is not None and sc_drift.get("estimated_origin_lon") is not None:
            origin_coords = [float(sc_drift["estimated_origin_lat"]), float(sc_drift["estimated_origin_lon"])]
        elif hindcast_res.estimated_origin_coords:
            origin_coords = list(hindcast_res.estimated_origin_coords)
        else:
            origin_coords = [19.040, 72.330]

        if sc_drift.get("estimated_origin_time"):
            origin_time_str = sc_drift["estimated_origin_time"]
            ref_origin_time = datetime.fromisoformat(origin_time_str.replace("Z", "+00:00"))
        elif isinstance(hindcast_res.estimated_origin_time, datetime):
            ref_origin_time = hindcast_res.estimated_origin_time
            origin_time_str = ref_origin_time.isoformat() + "Z"
        else:
            origin_time_str = str(hindcast_res.estimated_origin_time or "2026-09-13T19:30:00Z")
            ref_origin_time = datetime.fromisoformat(origin_time_str.replace("Z", "+00:00"))

        source_payload = {
            "coords": origin_coords,  # [lat, lon]
            "timestamp": origin_time_str,
            "confidence": hindcast_res.confidence_score,
            "uncertainty_radius_m": 850.0,
            "region": scenario_info.get("region", "Arabian Sea"),
        }

        # 6. Run Drift Forecast (forward simulation)
        forecast_res = drift_service.simulate_for_scenario(
            scenario_id=scenario_id,
            run_type="FORECAST",
        )
        forecast_points = [
            {
                "step": p.timestep_index,
                "time": p.timestamp.isoformat() + "Z" if isinstance(p.timestamp, datetime) else str(p.timestamp),
                "lat": p.latitude,
                "lon": p.longitude,
                "velocity": p.velocity,
                "direction": p.direction,
                "uncertainty_radius_m": p.uncertainty_radius_m,
            }
            for p in forecast_res.trajectory_points
        ]

        drift_payload = {
            "run_type": "HINDCAST_AND_FORECAST",
            "model_source": hindcast_res.model_source,
            "duration_hours": hindcast_res.duration_hours,
            "hindcast_points": hindcast_points,
            "forecast_points": forecast_points,
            "parameters": hindcast_res.parameters,
        }

        # 7. Query Nearby AIS Vessels & 8. Analyze Behavior & 9. Calculate Transparent Scores
        vessels_data = self.ais_provider.get_vessels_for_scenario(scenario_id)

        correlated_candidates = correlation_engine.correlate_vessels(
            vessels=vessels_data,
            source_lat=origin_coords[0],
            source_lon=origin_coords[1],
            source_time=ref_origin_time,
            search_radius_nm=30.0,
            time_window_hours=24.0,
        )

        # 10. Rank Candidate Vessels
        ranked_candidates = []
        for c in correlated_candidates:
            c_dict = c.model_dump()
            c_dict["vessel_name"] = c_dict.get("name", "")
            c_dict["category"] = c_dict.get("correlation_category", "Potential source vessel")
            ranked_candidates.append(c_dict)

        ranked_candidates = sorted(
            ranked_candidates,
            key=lambda x: x["correlation_score"],
            reverse=True,
        )
        for idx, cand in enumerate(ranked_candidates):
            cand["rank"] = idx + 1

        vessel_scores_map = {
            c["mmsi"]: {
                "overall_score": c["correlation_score"],
                "spatial_score": c.get("spatial_score", 0.0),
                "temporal_score": c.get("temporal_score", 0.0),
                "trajectory_score": c.get("trajectory_score", 0.0),
                "behavior_score": c.get("behavior_score", 0.0),
                "confidence_level": c.get("confidence_level", "Medium"),
                "priority": c.get("priority", "Moderate"),
            }
            for c in ranked_candidates
        }

        evidence_map = {
            c["mmsi"]: {
                "structured_evidence": c.get("evidence", []) or c.get("structured_evidence", []),
                "human_explanations": c.get("explanations", []) or c.get("human_explanations", []),
                "summary": c.get("suspicion_reason", "") or (c.get("explanations", [""])[0] if c.get("explanations") else ""),
            }
            for c in ranked_candidates
        }

        # 11. Build Chronological Investigation Timeline
        primary_candidate = ranked_candidates[0] if ranked_candidates else None
        timeline = self._build_investigation_timeline(
            scenario_info=scenario_info,
            sat_obs=sat_obs,
            spill=spill_payload,
            source=source_payload,
            primary_candidate=primary_candidate,
            candidate_count=len(ranked_candidates),
        )

        completed_time_iso = datetime.utcnow().isoformat() + "Z"
        timestamps = {
            "satellite_observation_time": sat_obs.get("acquisition_time", ""),
            "estimated_release_time": origin_time_str,
            "analysis_started_at": start_time_iso,
            "analysis_completed_at": completed_time_iso,
        }

        # Determine Case Number
        scenario_case_codes = {
            "scenario_a": "INV-2026-MUM-041",
            "scenario_b": "INV-2026-GOA-019",
            "scenario_c": "INV-2026-GUJ-007",
        }
        case_number = scenario_case_codes.get(scenario_id, f"INV-2026-{uuid.uuid4().hex[:6].upper()}")

        investigation_id = f"inv-{scenario_id}"

        # 12. Create Full Investigation Dossier Object
        investigation_dossier = {
            "id": investigation_id,
            "case_number": case_number,
            "scenario_id": scenario_id,
            "status": "TRIAGED" if scenario_id != "scenario_a" else "ESCALATED_TO_COAST_GUARD",
            "lead_agency": "Indian Coast Guard - Maritime Law Enforcement",
            "summary_notes": f"Automated SAR intelligence and Lagrangian attribution for {scenario_info.get('title', scenario_id)}.",
            "spill": spill_payload,
            "drift": drift_payload,
            "source": source_payload,
            "ais_candidates": ranked_candidates,
            "vessel_scores": vessel_scores_map,
            "evidence": evidence_map,
            "timeline": timeline,
            "timestamps": timestamps,
            "created_at": completed_time_iso,
            "updated_at": completed_time_iso,
        }

        # 13. Persist to SQLite Database if session available
        if save_to_db and db is not None:
            self._persist_to_db(db, investigation_dossier, primary_candidate)

        return investigation_dossier

    def _build_investigation_timeline(
        self,
        scenario_info: Dict[str, Any],
        sat_obs: Dict[str, Any],
        spill: Dict[str, Any],
        source: Dict[str, Any],
        primary_candidate: Optional[Dict[str, Any]],
        candidate_count: int,
    ) -> List[Dict[str, Any]]:
        """Constructs an evidentiary chronological timeline."""
        events = [
            {
                "timestamp": sat_obs.get("acquisition_time", "2026-09-14T01:28:45Z"),
                "stage": "SATELLITE_OBSERVATION",
                "title": "Satellite SAR Acquisition",
                "description": f"Sentinel-1A C-SAR IW scene {sat_obs.get('scene_id', '')} ingested over {scenario_info.get('region', '')}.",
                "badge": "SAR INGESTION",
                "status": "COMPLETED",
            },
            {
                "timestamp": sat_obs.get("acquisition_time", "2026-09-14T01:28:45Z"),
                "stage": "SPILL_DETECTION",
                "title": "Oil Spill Segmentation & Geometry Extracted",
                "description": f"Deep neural U-Net segmented a slick of {spill.get('area_sqkm', 0):.2f} km² with {spill.get('confidence', 0)*100:.1f}% confidence.",
                "badge": "SPILL CONFIRMED",
                "status": "COMPLETED",
            },
            {
                "timestamp": source.get("timestamp", "2026-09-13T19:30:00Z"),
                "stage": "DRIFT_HINDCAST",
                "title": "Lagrangian Hindcast Reconstructed Origin",
                "description": f"Reverse particle modeling identified discharge locus at {source.get('coords', [0,0])[0]:.4f}°N, {source.get('coords', [0,0])[1]:.4f}°E at {source.get('timestamp', '')}.",
                "badge": "SOURCE ESTIMATED",
                "status": "COMPLETED",
            },
            {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "stage": "AIS_CORRELATION",
                "title": "AIS Spatial-Temporal Correlation & Anomaly Scan",
                "description": f"Queried regional maritime traffic stream; evaluated {candidate_count} candidate vessels against discharge window.",
                "badge": f"{candidate_count} VESSELS TRACKED",
                "status": "COMPLETED",
            },
        ]

        if primary_candidate:
            events.append({
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "stage": "VESSEL_RANKING",
                "title": f"Attribution Ranking: {primary_candidate.get('vessel_name', 'Unknown')}",
                "description": f"Rank #1 candidate scored {primary_candidate.get('correlation_score', 0):.1f}/100 with category '{primary_candidate.get('category', 'Investigate')}'.",
                "badge": f"SCORE {primary_candidate.get('correlation_score', 0):.1f}",
                "status": "COMPLETED",
            })

        events.append({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "stage": "INVESTIGATION_READY",
            "title": "Investigation Dossier Finalized",
            "description": "Attribution correlation package compiled and prepared for Coast Guard investigation priority review.",
            "badge": "DOSSIER READY",
            "status": "READY",
        })

        return events

    def _persist_to_db(
        self,
        db: Session,
        dossier: Dict[str, Any],
        primary_candidate: Optional[Dict[str, Any]],
    ) -> None:
        """Persists the investigation dossier and underlying spill to the SQLite database."""
        try:
            # 1. Ensure Spill record exists in DB
            spill_id = dossier["spill"]["id"]
            existing_spill = db.query(SpillDetection).filter(SpillDetection.id == spill_id).first()
            if not existing_spill:
                try:
                    det_time = datetime.fromisoformat(dossier["spill"]["detection_time"].replace("Z", "+00:00"))
                except Exception:
                    det_time = datetime.utcnow()

                new_spill = SpillDetection(
                    id=spill_id,
                    detection_time=det_time,
                    geometry_geojson=json.dumps(dossier["spill"].get("geometry", {})),
                    centroid_lat=dossier["spill"]["centroid"][0],
                    centroid_lon=dossier["spill"]["centroid"][1],
                    area_sqkm=dossier["spill"]["area_sqkm"],
                    perimeter_km=dossier["spill"]["perimeter_km"],
                    estimated_age_hours=dossier["spill"].get("estimated_age_hours", 18.0),
                    confidence_score=dossier["spill"]["confidence"],
                    region_name=dossier["source"].get("region", "Arabian Sea"),
                )
                db.add(new_spill)
                db.commit()

            # 2. Check if Investigation exists
            case_num = dossier["case_number"]
            existing_inv = db.query(Investigation).filter(
                (Investigation.case_number == case_num) | (Investigation.id == dossier["id"])
            ).first()

            evidence_json = json.dumps(dossier, default=str)

            if existing_inv:
                existing_inv.evidence_package_json = evidence_json
                existing_inv.status = dossier["status"]
                existing_inv.summary_notes = dossier["summary_notes"]
                db.commit()
            else:
                new_inv = Investigation(
                    id=dossier["id"],
                    case_number=case_num,
                    spill_id=spill_id,
                    primary_suspect_id=primary_candidate.get("vessel_id") if primary_candidate else None,
                    status=dossier["status"],
                    lead_agency=dossier["lead_agency"],
                    summary_notes=dossier["summary_notes"],
                    evidence_package_json=evidence_json,
                )
                db.add(new_inv)
                db.commit()

        except Exception as err:
            db.rollback()
            # Do not crash if DB write encounters conflict; in-memory orchestrator payload is preserved
            print(f"[InvestigationOrchestrator] DB persistence note: {err}")


investigation_orchestrator = InvestigationOrchestrator()
