import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Checkpoint } from '../types/mission';

interface MapViewProps {
  geometry: [number, number][];
  checkpoints: [number, number][];
  missionCheckpoints?: Checkpoint[];
  startPoint?: [number, number];
  heightClass?: string;
  zoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  geometry,
  checkpoints,
  missionCheckpoints = [],
  startPoint,
  heightClass = 'h-72 sm:h-96',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<L.Layer[]>([]);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initial center: startPoint, or first point of geometry, or default
      const initialCenter = startPoint || geometry[0] || [40.785091, -73.968285];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Free OpenStreetMap Tile Layer with standard OpenStreetMap attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Clear previous route polylines
    routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (geometry.length > 0) {
      // Background dark casing line to pop sharply against OSM road lines
      const casing = L.polyline(geometry, {
        color: '#064e3b',
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Foreground bright emerald street route line
      const polyline = L.polyline(geometry, {
        color: '#10b981',
        weight: 5,
        opacity: 1.0,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routeLayersRef.current = [casing, polyline];

      // Fit map to show full route with padding
      map.fitBounds(polyline.getBounds(), {
        padding: [30, 30],
        maxZoom: 17,
      });
    }

    // Custom SVG Icon Helper
    const createCustomIcon = (label: string, bg: string, textCol = '#ffffff') => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: ${bg};
            color: ${textCol};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            border: 2px solid #ffffff;
          ">
            ${label}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });
    };

    // Add Start marker
    const origin = startPoint || geometry[0];
    if (origin && markersLayerRef.current) {
      const startMarker = L.marker(origin, {
        icon: createCustomIcon('▶', '#059669'),
      }).bindPopup('<b>Start & Finish Point</b><br><span style="font-size:11px;color:#9ca3af;">Located on walkable street</span>');
      markersLayerRef.current.addLayer(startMarker);
    }

    // Add Checkpoint markers placed strictly along the road geometry
    if (markersLayerRef.current) {
      checkpoints.forEach((coord, i) => {
        const cpInfo = missionCheckpoints[i];
        const title = cpInfo?.title || `Checkpoint ${i + 1}`;
        const instr = cpInfo?.instruction || '';

        const marker = L.marker(coord, {
          icon: createCustomIcon(`${i + 1}`, '#d97706'),
        }).bindPopup(`
          <div style="font-family: inherit; min-width: 140px;">
            <div style="font-weight: bold; color: #f59e0b; margin-bottom: 2px;">CP ${i + 1}: ${title}</div>
            <div style="font-size: 12px; color: #d1d5db;">${instr}</div>
            <div style="font-size: 10px; color: #10b981; margin-top: 4px;">✓ Located along public road/trail</div>
          </div>
        `);
        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [geometry, checkpoints, missionCheckpoints, startPoint]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`w-full ${heightClass} relative rounded-xl overflow-hidden border border-[#24352d] shadow-inner`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
