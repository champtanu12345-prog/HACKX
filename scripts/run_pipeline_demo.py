"""End-to-End Demonstration Script for SIH 260143 HACKX Pipeline.

Demonstrates:
1. Synthetic SAR observation ingestion
2. ML slick segmentation & geometric extraction
3. Lagrangian drift hindcast simulation
4. AIS telemetry correlation
5. Multi-factor suspicion scoring & culprit ranking
6. Enforcement dossier generation
"""

import sys
import os
import json
from datetime import datetime, timedelta
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.preprocessing.sar_preprocessor import SARPreprocessor
from ml.postprocessing.geometry_extractor import SpillGeometryExtractor
from ml.inference.detector import OilSpillDetector
from backend.services.drift_engine import LagrangianDriftEngine
from backend.services.scoring_engine import WeightedVesselScoringEngine
from backend.services.providers.ais import MockAISProvider


def run_pipeline_demo():
    print("=" * 70)
    print(" HACKX — OIL SPILL INTELLIGENCE & ATTRIBUTION SYSTEM")
    print(" SIH Problem Statement 260143 Demonstration Pipeline")
    print("=" * 70)

    # 1. Simulate SAR patch ingestion
    print("\n[STEP 1] Ingesting Sentinel-1 C-SAR IW GRD Imagery...")
    # Synthetic 200x200 patch with dark formation
    np.random.seed(42)
    sar_patch = np.random.uniform(20.0, 50.0, (150, 150))
    # Inject dark slick signature
    sar_patch[50:90, 60:110] = np.random.uniform(0.5, 3.0, (40, 50))

    detector = OilSpillDetector()
    results = detector.process_sar_patch(
        raw_pixels=sar_patch,
        top_left_lat=19.25,
        top_left_lon=72.20,
    )
    metrics = results["metrics"]
    print(f" -> Slick Detected: {results['detection_flag']}")
    print(f" -> Confidence: {results['confidence_score'] * 100:.1f}%")
    print(f" -> Area: {metrics['area_sqkm']} sq km | Perimeter: {metrics['perimeter_km']} km")
    print(f" -> Centroid: Lat {metrics['centroid_lat']:.4f}°N, Lon {metrics['centroid_lon']:.4f}°E")
    print(f" -> Estimated Weathering Age: {metrics['estimated_age_hours']} hours")

    # 2. Lagrangian Hindcast Drift Simulation
    print("\n[STEP 2] Running Lagrangian Reverse-Trajectory Hindcast...")
    drift_engine = LagrangianDriftEngine()
    sim = drift_engine.run_simulation(
        start_lat=metrics["centroid_lat"],
        start_lon=metrics["centroid_lon"],
        start_time=datetime.utcnow(),
        duration_hours=metrics["estimated_age_hours"],
        run_type="HINDCAST",
        particle_count=100,
    )
    origin_lat = sim["estimated_origin_lat"]
    origin_lon = sim["estimated_origin_lon"]
    origin_time = sim["estimated_origin_time"]
    print(f" -> Hindcast Origin: Lat {origin_lat:.4f}°N, Lon {origin_lon:.4f}°E")
    print(f" -> Hindcast Origin Timestamp: {origin_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f" -> Simulation Trajectory Steps: {len(sim['trajectory_points'])} hours back-computed")

    # 3. AIS Telemetry Correlation & Suspicion Scoring
    print("\n[STEP 3] Correlating AIS Telemetry & Scoring Candidate Vessels...")
    ais_provider = MockAISProvider()
    vessels = ais_provider.query_vessels_in_corridor(
        bbox=[origin_lon - 0.5, origin_lat - 0.5, origin_lon + 0.5, origin_lat + 0.5],
        start_time=origin_time - timedelta(hours=4),
        end_time=origin_time + timedelta(hours=4),
    )
    print(f" -> Vessels tracked in corridor window: {len(vessels)}")

    scoring_engine = WeightedVesselScoringEngine()
    scored_vessels = []
    for v in vessels:
        sc = scoring_engine.score_vessel(
            vessel=v,
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            origin_time=origin_time,
        )
        scored_vessels.append(sc)

    scored_vessels.sort(key=lambda x: x["composite_score"], reverse=True)

    print("\n[STEP 4] Vessel Attribution Ranking Leaderboard:")
    print("-" * 70)
    print(f"{'Rank':<5} {'Vessel Name':<20} {'MMSI':<12} {'Type':<18} {'Score':<6} {'Min Dist'}")
    print("-" * 70)
    for i, sv in enumerate(scored_vessels, 1):
        print(
            f"#{i:<4} {sv['name']:<20} {sv['mmsi']:<12} {sv['vessel_type']:<18} {sv['composite_score']:<6.1f} {sv['min_distance_nm']:.1f} nm"
        )
        if sv["anomalies"]:
            for a in sv["anomalies"]:
                print(f"      [!] Flag: {a['anomaly_type']} - {a['details']}")
    print("-" * 70)

    top_candidate = scored_vessels[0]
    print(f"\n[STEP 5] Potential Source Vessel Identified: {top_candidate['name']} (Correlation Score: {top_candidate['composite_score']}/100 - Requires Investigation)")
    print(f" -> Compiling Investigation Priority Dossier for Indian Coast Guard Maritime Inspection.")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline_demo()
