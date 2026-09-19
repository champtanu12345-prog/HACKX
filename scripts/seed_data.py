import json
import os
import sys
from datetime import datetime, timedelta

# Add workspace root to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.core.database import SessionLocal, init_db
from backend.models.satellite import SatelliteObservation
from backend.models.spill import SpillDetection
from backend.models.vessel import Vessel, AisPosition, VesselAnomaly, VesselScore
from backend.models.drift import DriftRun, TrajectoryPoint
from backend.models.investigation import Investigation
from backend.services.drift_engine import LagrangianDriftEngine
from backend.services.scoring_engine import WeightedVesselScoringEngine


def seed():
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_spill = db.query(SpillDetection).first()
        if existing_spill:
            print("Database already contains records. Clearing existing records for clean seed...")
            db.query(TrajectoryPoint).delete()
            db.query(DriftRun).delete()
            db.query(VesselScore).delete()
            db.query(VesselAnomaly).delete()
            db.query(AisPosition).delete()
            db.query(Investigation).delete()
            db.query(SpillDetection).delete()
            db.query(SatelliteObservation).delete()
            db.query(Vessel).delete()
            db.commit()

        print("Seeding Satellite Observations & Spill Detections...")
        sample_spill_file = os.path.join(os.path.dirname(__file__), "..", "data", "samples", "sample_spill.geojson")
        with open(sample_spill_file, "r", encoding="utf-8") as f:
            spill_geojson = json.load(f)

        features = spill_geojson.get("features", [])
        created_spills = []

        for feat in features:
            props = feat["properties"]
            geom_str = json.dumps(feat["geometry"])

            # Create Satellite observation
            obs = SatelliteObservation(
                scene_id=props["scene_id"],
                satellite_name=props["satellite"],
                sensor_type="SAR",
                acquisition_time=datetime.fromisoformat(props["acquisition_time"].replace("Z", "+00:00")),
                footprint_geojson=geom_str,
                cloud_cover_percentage=0.0,
                resolution_meters=10.0,
            )
            db.add(obs)
            db.commit()
            db.refresh(obs)

            # Compute centroid from coords
            poly_coords = feat["geometry"]["coordinates"][0]
            avg_lon = sum(pt[0] for pt in poly_coords) / len(poly_coords)
            avg_lat = sum(pt[1] for pt in poly_coords) / len(poly_coords)

            spill = SpillDetection(
                observation_id=obs.id,
                detection_time=obs.acquisition_time,
                geometry_geojson=geom_str,
                centroid_lat=avg_lat,
                centroid_lon=avg_lon,
                area_sqkm=props["area_sqkm"],
                perimeter_km=props["perimeter_km"],
                estimated_volume_m3=props.get("estimated_volume_m3"),
                estimated_age_hours=props.get("estimated_age_hours", 14.0),
                confidence_score=props["confidence_score"],
                region_name=props["region"],
            )
            db.add(spill)
            db.commit()
            db.refresh(spill)
            created_spills.append(spill)

        print(f"Created {len(created_spills)} oil spill detections.")

        # Seed Vessels and AIS
        print("Seeding Vessels, AIS telemetry, and Anomaly logs...")
        sample_ais_file = os.path.join(os.path.dirname(__file__), "..", "data", "samples", "sample_ais_tracks.json")
        with open(sample_ais_file, "r", encoding="utf-8") as f:
            ais_data = json.load(f)

        vessels_map = {}
        for v in ais_data.get("vessels", []):
            vessel_obj = Vessel(
                mmsi=v["mmsi"],
                imo=v.get("imo"),
                name=v["name"],
                callsign=v.get("callsign"),
                vessel_type=v["vessel_type"],
                flag_country=v["flag_country"],
                length_m=v.get("length_m"),
                width_m=v.get("width_m"),
                draught_m=v.get("draught_m"),
            )
            db.add(vessel_obj)
            db.commit()
            db.refresh(vessel_obj)
            vessels_map[v["mmsi"]] = vessel_obj

            for p in v.get("positions", []):
                t_pos = datetime.fromisoformat(p["timestamp"].replace("Z", "+00:00"))
                ais_p = AisPosition(
                    vessel_id=vessel_obj.id,
                    timestamp_utc=t_pos,
                    latitude=p["latitude"],
                    longitude=p["longitude"],
                    sog_knots=p["sog"],
                    cog_degrees=p["cog"],
                    nav_status=p.get("nav_status", "Under way using engine"),
                )
                db.add(ais_p)

            for a in v.get("anomalies", []):
                t_start = datetime.fromisoformat(a["start_time"].replace("Z", "+00:00"))
                t_end = datetime.fromisoformat(a["end_time"].replace("Z", "+00:00")) if a.get("end_time") else None
                anomaly_obj = VesselAnomaly(
                    vessel_id=vessel_obj.id,
                    spill_id=created_spills[0].id if created_spills else None,
                    anomaly_type=a["anomaly_type"],
                    start_time=t_start,
                    end_time=t_end,
                    severity=a["severity"],
                    details=a["details"],
                )
                db.add(anomaly_obj)

            db.commit()

        print(f"Created {len(vessels_map)} vessels with AIS tracks.")

        # Run drift simulation for the primary spill
        if created_spills:
            primary_spill = created_spills[0]
            print(f"Running Lagrangian Hindcast Drift Simulation for {primary_spill.id}...")
            drift_engine = LagrangianDriftEngine()
            sim_res = drift_engine.run_simulation(
                start_lat=primary_spill.centroid_lat,
                start_lon=primary_spill.centroid_lon,
                start_time=primary_spill.detection_time,
                duration_hours=primary_spill.estimated_age_hours,
                run_type="HINDCAST",
                particle_count=200,
            )

            drift_run = DriftRun(
                spill_id=primary_spill.id,
                run_type="HINDCAST",
                simulation_start_time=sim_res["simulation_start_time"],
                simulation_end_time=sim_res["simulation_end_time"],
                duration_hours=sim_res["duration_hours"],
                particle_count=sim_res["particle_count"],
                estimated_origin_lat=sim_res["estimated_origin_lat"],
                estimated_origin_lon=sim_res["estimated_origin_lon"],
                estimated_origin_time=sim_res["estimated_origin_time"],
                status="COMPLETED",
            )
            db.add(drift_run)
            db.commit()
            db.refresh(drift_run)

            for pt in sim_res["trajectory_points"]:
                t_pt = TrajectoryPoint(
                    drift_run_id=drift_run.id,
                    timestep_utc=pt["timestep_utc"],
                    latitude=pt["latitude"],
                    longitude=pt["longitude"],
                    uncertainty_radius_m=pt["uncertainty_radius_m"],
                    wind_speed_ms=pt.get("wind_speed_ms"),
                    current_speed_ms=pt.get("current_speed_ms"),
                    particle_index=pt.get("particle_index", 0),
                )
                db.add(t_pt)
            db.commit()

            # Score vessels against hindcast origin
            print("Scoring candidate vessels for spill attribution...")
            scorer = WeightedVesselScoringEngine()
            suspect_scores = []
            for v_data in ais_data.get("vessels", []):
                score_dict = scorer.score_vessel(
                    vessel=v_data,
                    origin_lat=sim_res["estimated_origin_lat"],
                    origin_lon=sim_res["estimated_origin_lon"],
                    origin_time=sim_res["estimated_origin_time"],
                )
                suspect_scores.append(score_dict)

            suspect_scores.sort(key=lambda x: x["composite_score"], reverse=True)

            primary_suspect_vessel = None
            for idx, sc in enumerate(suspect_scores, start=1):
                v_model = vessels_map.get(sc["mmsi"])
                if v_model:
                    if idx == 1:
                        primary_suspect_vessel = v_model
                    vs = VesselScore(
                        spill_id=primary_spill.id,
                        vessel_id=v_model.id,
                        rank=idx,
                        composite_score=sc["composite_score"],
                        proximity_score=sc["proximity_score"],
                        trajectory_alignment=sc["trajectory_alignment"],
                        speed_anomaly_score=sc["speed_anomaly_score"],
                        ais_gap_penalty=sc["ais_gap_penalty"],
                        details_json=json.dumps(sc["anomalies"]),
                    )
                    db.add(vs)
            db.commit()

            # Create an investigation dossier
            print("Creating Indian Coast Guard formal investigation dossier...")
            inv = Investigation(
                case_number="INV-2026-MUM041",
                spill_id=primary_spill.id,
                primary_suspect_id=primary_suspect_vessel.id if primary_suspect_vessel else None,
                status="ESCALATED_TO_COAST_GUARD",
                lead_agency="Indian Coast Guard - Western Command",
                summary_notes=(
                    "Satellite Sentinel-1A SAR detected 14.85 sq km crude slick 22nm off Mumbai High. "
                    "Hindcasting traces origin to 2026-09-13 21:45 UTC. Crude tanker MT ARABIAN STAR (MMSI: 419000123) "
                    "exhibited abnormal 73% deceleration and transponder blackout for 2h 20m during that exact window."
                ),
            )
            db.add(inv)
            db.commit()

        print("\nSeed completed successfully!")
        print(f"Spills: {db.query(SpillDetection).count()}")
        print(f"Vessels: {db.query(Vessel).count()}")
        print(f"AIS positions: {db.query(AisPosition).count()}")
        print(f"Anomalies: {db.query(VesselAnomaly).count()}")
        print(f"Investigations: {db.query(Investigation).count()}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
