import React from 'react';
import { AppShell } from './components/shell/AppShell';
import { MapProvider } from './components/map/MapProvider';

export const App: React.FC = () => {
  return (
    <MapProvider>
      <AppShell />
    </MapProvider>
  );
};

export default App;
