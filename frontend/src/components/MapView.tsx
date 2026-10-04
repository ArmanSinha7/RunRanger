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

