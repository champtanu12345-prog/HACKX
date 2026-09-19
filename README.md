# HACKX — Oil Spill Intelligence & Attribution System
> **Smart India Hackathon 2026** | **Problem Statement ID: SIH 260143**  
> **Theme:** Disaster Management | **Category:** Software | **Team:** HackX

---

## 🌊 Executive Summary
**HACKX** is an end-to-end maritime intelligence platform designed to eliminate the anonymity of marine oil dumping. It autonomously bridges Synthetic Aperture Radar (SAR) and Electro-Optical (EO) satellite imagery with oceanographic physics (reverse drift hindcasting) and historical Automatic Identification System (AIS) telemetry to pinpoint offending vessels and generate tamper-evident legal dossiers for the **Indian Coast Guard** and maritime enforcement agencies.

---

## 🔄 End-to-End Workflow

```
[Satellite Earth Observation]
       │ (Sentinel-1 SAR / Sentinel-2 EO)
       ▼
[Oil Slick ML Segmentation]
       │ (U-Net / Deep Edge Detection)
       ▼
[Geometric & Weathering Extraction]
       │ (Area, Perimeter, Centroid, Estimated Slick Age)
       ▼
[Lagrangian Drift Hindcasting & Forecasting]
       │ (NOAA Wind + Copernicus Ocean Currents)
       ▼
[AIS Spatiotemporal Correlation]
       │ (Corridor Intersect & Transponder Gap Detection)
       ▼
[Vessel Behavioral Scoring]
       │ (Proximity, Speed Anomaly, Dark Vessel Blackout)
       ▼
[Operational GIS Investigation Dashboard]
```

---

## 🏛️ System Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, MapLibre GL JS, Recharts, Lucide Icons, Axios, React Query. Professional maritime workstation interface designed for coast guard operational centers.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0. Clean architecture separated into `api/`, `core/`, `models/`, `schemas/`, `services/`, and `repositories/`.
- **Database**: PostgreSQL 16 with PostGIS extensions (production / Docker) with zero-configuration SQLite fallback for local developer testing.
- **ML / Geospatial**: PyTorch (U-Net), OpenCV, NumPy, Shapely, GeoPandas, Rasterio.
- **Physics Engine**: Lagrangian particle tracking framework for forward dispersion and reverse hindcast trajectory calculation using windage and current vectors.

---

## 📁 Repository Structure

```
├── backend/            # FastAPI REST backend
│   ├── api/v1/         # Versioned endpoints (health, spills, drift, vessels, investigations)
│   ├── core/           # Configuration, database connections & session lifecycle
│   ├── models/         # SQLAlchemy 2.0 ORM database entities
│   ├── schemas/        # Pydantic v2 validation and serialization schemas
│   ├── services/       # Provider abstractions (Satellite, AIS, Weather, Current) & engines
│   └── repositories/   # Abstract data access layer
├── frontend/           # Tactical GIS Maritime Workstation
│   ├── src/components/ # Map, Vessel Dossier, Metric Panels, Suspect Leaderboard
│   ├── src/pages/      # Dashboard, Spills List, Investigation Details
│   └── src/api/        # Axios API client
├── ml/                 # Machine learning & SAR segmentation pipeline
│   ├── models/         # U-Net architecture definitions
│   ├── preprocessing/  # SAR calibration and speckle filtering
│   ├── postprocessing/ # Polygon extraction, geometry and area calculation
│   └── inference/      # Inference engine with fallback heuristics
├── data/               # Raw, processed, and sample geospatial datasets
├── scripts/            # Database seeders and demonstration runners
├── tests/              # Backend and ML test suites
└── docs/               # Architecture, API specifications, and data pipeline docs
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

### 1. Backend Setup
```powershell
# In project root:
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Seed the database with sample Arabian Sea incident
python scripts/seed_data.py

# Launch FastAPI server
python -m uvicorn backend.main:app --reload --port 8000
```
Swagger UI will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Workstation dashboard will be accessible at: `http://localhost:5173`

### 3. Run Automated Tests
```powershell
python -m pytest tests/ -v
```

---

## ⚖️ License
Developed for Smart India Hackathon 2026. All rights reserved.
