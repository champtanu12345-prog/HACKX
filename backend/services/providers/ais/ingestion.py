"""AIS Data Ingestion Engine for CSV and JSON datasets."""

import csv
import io
import json
from datetime import datetime
from typing import List, Dict, Any, Union, Optional
from backend.services.providers.ais.models import NormalizedAisPosition, NormalizedVesselStatic


class AISIngestionParser:
    """Parses raw AIS telemetry files in CSV and JSON formats into normalized data models."""

    @staticmethod
    def _parse_timestamp(val: Any) -> datetime:
        """Flexible parser for ISO8601, standard nautical timestamps, and epoch numbers."""
        if isinstance(val, datetime):
            return val
        s = str(val).strip()
        # Epoch timestamp
        try:
            if s.isdigit() and len(s) >= 10:
                return datetime.utcfromtimestamp(float(s) if len(s) == 10 else float(s) / 1000.0)
        except Exception:
            pass

        formats = [
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%Y-%m-%d %H:%M:%S%z",
        ]
        # Remove trailing Z for basic formats if needed
        clean_s = s.replace("Z", "")
        for fmt in formats:
            try:
                return datetime.strptime(s, fmt)
            except ValueError:
                pass
            try:
                return datetime.strptime(clean_s, fmt)
            except ValueError:
                pass
        return datetime.utcnow()

    def parse_json(self, content_or_path: Union[str, bytes, List[Any], Dict[str, Any]]) -> List[NormalizedAisPosition]:
        """Ingests AIS records from JSON string, bytes, dictionary, or file."""
        if isinstance(content_or_path, (dict, list)):
            data = content_or_path
        elif isinstance(content_or_path, bytes):
            data = json.loads(content_or_path.decode("utf-8"))
        elif isinstance(content_or_path, str):
            # Check if JSON string or file path
            content_str = content_or_path.strip()
            if content_str.startswith("{") or content_str.startswith("["):
                data = json.loads(content_str)
            else:
                with open(content_or_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
        else:
            raise ValueError(f"Unsupported JSON source type: {type(content_or_path)}")

        positions: List[NormalizedAisPosition] = []

        # Handle nested {"vessels": [...]}
        if isinstance(data, dict) and "vessels" in data:
            vessels_list = data["vessels"]
            for v in vessels_list:
                mmsi = str(v.get("mmsi", ""))
                vname = str(v.get("name") or v.get("vessel_name") or "Unknown")
                imo = v.get("imo")
                vtype = v.get("vessel_type", "Cargo")
                for p in v.get("positions", []):
                    try:
                        pos = NormalizedAisPosition(
                            mmsi=mmsi,
                            vessel_name=vname,
                            imo=imo,
                            timestamp=self._parse_timestamp(p.get("timestamp") or p.get("timestamp_utc")),
                            latitude=float(p.get("latitude") or p.get("lat")),
                            longitude=float(p.get("longitude") or p.get("lon")),
                            speed=float(p.get("speed") or p.get("sog") or p.get("sog_knots") or 0.0),
                            course=float(p.get("course") or p.get("cog") or p.get("cog_degrees") or 0.0),
                            heading=float(p.get("heading") or p.get("heading_degrees")) if p.get("heading") is not None else None,
                            navigation_status=str(p.get("nav_status") or p.get("navigation_status") or "Under way using engine"),
                        )
                        positions.append(pos)
                    except Exception:
                        continue
            return positions

        # Handle flat list of position records
        items = data if isinstance(data, list) else data.get("positions", [data])
        for item in items:
            try:
                pos = NormalizedAisPosition(
                    mmsi=str(item.get("mmsi") or item.get("MMSI") or "000000000"),
                    vessel_name=str(item.get("vessel_name") or item.get("name") or item.get("VesselName") or "Unknown"),
                    imo=str(item.get("imo") or item.get("IMO")) if item.get("imo") or item.get("IMO") else None,
                    timestamp=self._parse_timestamp(item.get("timestamp") or item.get("BaseDateTime") or item.get("time")),
                    latitude=float(item.get("latitude") or item.get("LAT") or item.get("lat")),
                    longitude=float(item.get("longitude") or item.get("LON") or item.get("lon")),
                    speed=float(item.get("speed") or item.get("SOG") or item.get("sog") or 0.0),
                    course=float(item.get("course") or item.get("COG") or item.get("cog") or 0.0),
                    heading=float(item.get("heading") or item.get("Heading")) if item.get("heading") or item.get("Heading") else None,
                    navigation_status=str(item.get("navigation_status") or item.get("Status") or "Under way using engine"),
                )
                positions.append(pos)
            except Exception:
                continue

        return positions

    def parse_csv(self, content_or_path: Union[str, bytes]) -> List[NormalizedAisPosition]:
        """Ingests AIS records from a CSV string, bytes, or file path.
        
        Maps heterogeneous column headers (e.g., MarineCadastre, Spire, raw NMEA extract).
        """
        if isinstance(content_or_path, bytes):
            reader = csv.DictReader(io.StringIO(content_or_path.decode("utf-8")))
        elif isinstance(content_or_path, str):
            if "\n" in content_or_path or "," in content_or_path:
                reader = csv.DictReader(io.StringIO(content_or_path))
            else:
                with open(content_or_path, "r", encoding="utf-8") as f:
                    csv_text = f.read()
                reader = csv.DictReader(io.StringIO(csv_text))
        else:
            raise ValueError(f"Unsupported CSV source type: {type(content_or_path)}")

        positions: List[NormalizedAisPosition] = []

        # Normalization mapping for standard column variations
        def get_col(row: Dict[str, str], *keys: str) -> Optional[str]:
            for k in keys:
                for row_k in row.keys():
                    if row_k and row_k.strip().lower() == k.lower():
                        return row[row_k]
            return None

        for row in reader:
            try:
                mmsi_val = get_col(row, "mmsi", "mmsi_number")
                if not mmsi_val:
                    continue

                lat_val = get_col(row, "lat", "latitude", "y")
                lon_val = get_col(row, "lon", "longitude", "long", "x")
                if not lat_val or not lon_val:
                    continue

                time_val = get_col(row, "timestamp", "basedatetime", "time", "date_time_utc", "datetime")
                parsed_time = self._parse_timestamp(time_val) if time_val else datetime.utcnow()

                sog_val = get_col(row, "speed", "sog", "speed_knots", "speed_over_ground")
                cog_val = get_col(row, "course", "cog", "course_over_ground")
                heading_val = get_col(row, "heading", "true_heading")
                vname = get_col(row, "vessel_name", "vesselname", "name", "shipname") or "Unknown"
                imo_val = get_col(row, "imo", "imo_number")
                status_val = get_col(row, "navigation_status", "status", "navstatus") or "Under way using engine"

                pos = NormalizedAisPosition(
                    mmsi=mmsi_val,
                    vessel_name=vname,
                    imo=imo_val,
                    timestamp=parsed_time,
                    latitude=float(lat_val),
                    longitude=float(lon_val),
                    speed=float(sog_val) if sog_val else 0.0,
                    course=float(cog_val) if cog_val else 0.0,
                    heading=float(heading_val) if heading_val else None,
                    navigation_status=status_val,
                )
                positions.append(pos)
            except Exception:
                continue

        return positions
