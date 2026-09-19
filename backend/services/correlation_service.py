from datetime import datetime, timedelta
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.models.spill import SpillDetection
from backend.models.drift import DriftRun, TrajectoryPoint
from backend.models.vessel import Vessel, AisPosition, VesselAnomaly, VesselScore
from backend.models.investigation import Investigation
from backend.services.drift_engine import DriftEngine, LagrangianDriftEngine
from backend.services.scoring_engine import VesselScoringEngine, WeightedVesselScoringEngine
from backend.services.providers.ais import AISProvider, MockAISProvider


class AISCorrelationService:
    def __init__(
        self,
        drift_engine: Optional[DriftEngine] = None,
        scoring_engine: Optional[VesselScoringEngine] = None,
        ais_provider: Optional[AISProvider] = None,
    ):
        self.drift_engine = drift_engine or LagrangianDriftEngine()
        self.scoring_engine = scoring_engine or WeightedVesselScoringEngine()
        self.ais_provider = ais_provider or MockAISProvider()

    def run_drift_for_spill(
        self,
        db: Session,
        spill: SpillDetection,
        run_type: str = "HINDCAST",
        duration_hours: float = 24.0,
        particle_count: int = 150,
        wind_factor: float = 0.03,
    ) -> DriftRun:
        """Executes particle drift model and persists trajectory points."""
        res = self.drift_engine.run_simulation(
            start_lat=spill.centroid_lat,
            start_lon=spill.centroid_lon,
            start_time=spill.detection_time,
            duration_hours=duration_hours,
            run_type=run_type,
            particle_count=particle_count,
            wind_factor=wind_factor,
        )

        drift_run = DriftRun(
            spill_id=spill.id,
            run_type=res["run_type"],
            simulation_start_time=res["simulation_start_time"],
            simulation_end_time=res["simulation_end_time"],
            duration_hours=res["duration_hours"],
            particle_count=res["particle_count"],
            estimated_origin_lat=res["estimated_origin_lat"],
            estimated_origin_lon=res["estimated_origin_lon"],
            estimated_origin_time=res["estimated_origin_time"],
            parameters_json=json.dumps({"wind_factor": wind_factor}),
            status="COMPLETED",
        )
        db.add(drift_run)
        db.commit()
        db.refresh(drift_run)

        # Persist points
        for pt in res["trajectory_points"]:
            tp = TrajectoryPoint(
                drift_run_id=drift_run.id,
                timestep_utc=pt["timestep_utc"],
                latitude=pt["latitude"],
                longitude=pt["longitude"],
                uncertainty_radius_m=pt["uncertainty_radius_m"],
                wind_speed_ms=pt.get("wind_speed_ms"),
                current_speed_ms=pt.get("current_speed_ms"),
                particle_index=pt.get("particle_index", 0),
            )
            db.add(tp)
        db.commit()
        db.refresh(drift_run)
        return drift_run

    def correlate_and_score_suspects(
        self,
        db: Session,
        spill: SpillDetection,
        origin_lat: Optional[float] = None,
        origin_lon: Optional[float] = None,
        origin_time: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Cross-references origin coordinates with AIS tracks and ranks suspects."""
        lat = origin_lat or spill.centroid_lat
        lon = origin_lon or spill.centroid_lon
        time_origin = origin_time or (spill.detection_time - timedelta(hours=spill.estimated_age_hours))

        # Query corridor vessels
        bbox = [lon - 0.7, lat - 0.7, lon + 0.7, lat + 0.7]
        vessels_data = self.ais_provider.query_vessels_in_corridor(
            bbox=bbox,
            start_time=time_origin - timedelta(hours=6),
            end_time=time_origin + timedelta(hours=6),
        )

        scored_list: List[Dict[str, Any]] = []
        for v in vessels_data:
            score_data = self.scoring_engine.score_vessel(
                vessel=v,
                origin_lat=lat,
                origin_lon=lon,
                origin_time=time_origin,
            )
            scored_list.append(score_data)

        # Sort descending by composite score
        scored_list.sort(key=lambda x: x["composite_score"], reverse=True)

        # Assign ranks
        for idx, item in enumerate(scored_list, start=1):
            item["rank"] = idx

        return scored_list


correlation_service = AISCorrelationService()
