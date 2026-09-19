import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MapTileProviderType = 'OSM' | 'CARTO_LIGHT' | 'ESRI_SATELLITE';

export interface TileProviderConfig {
  id: MapTileProviderType;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export const MAP_PROVIDERS: Record<MapTileProviderType, TileProviderConfig> = {
  OSM: {
    id: 'OSM',
    name: 'OpenStreetMap (Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
  },
  CARTO_LIGHT: {
    id: 'CARTO_LIGHT',
    name: 'Carto Light (Tactical Clean)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  ESRI_SATELLITE: {
    id: 'ESRI_SATELLITE',
    name: 'Esri World Imagery (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

interface MapContextValue {
  provider: MapTileProviderType;
  setProvider: (provider: MapTileProviderType) => void;
  config: TileProviderConfig;
  isSatellite: boolean;
  toggleSatellite: () => void;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
  defaultProvider?: MapTileProviderType;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children, defaultProvider }) => {
  // Read from environment variable VITE_MAP_PROVIDER or default strictly to OSM
  const initialProvider: MapTileProviderType =
    defaultProvider ||
    (((import.meta as any).env?.VITE_MAP_PROVIDER as MapTileProviderType) || 'OSM');

  const [provider, setProvider] = useState<MapTileProviderType>(
    MAP_PROVIDERS[initialProvider] ? initialProvider : 'OSM'
  );

  const isSatellite = provider === 'ESRI_SATELLITE';

  const toggleSatellite = () => {
    setProvider((prev) => (prev === 'ESRI_SATELLITE' ? 'OSM' : 'ESRI_SATELLITE'));
  };

  const config = MAP_PROVIDERS[provider] || MAP_PROVIDERS.OSM;

  return (
    <MapContext.Provider
      value={{
        provider,
        setProvider,
        config,
        isSatellite,
        toggleSatellite,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapProvider = (): MapContextValue => {
  const context = useContext(MapContext);
  if (!context) {
    // Fallback if rendered outside provider: safe default to OSM
    return {
      provider: 'OSM',
      setProvider: () => {},
      config: MAP_PROVIDERS.OSM,
      isSatellite: false,
      toggleSatellite: () => {},
    };
  }
  return context;
};
