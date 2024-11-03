"use client";

import dynamic from 'next/dynamic';
import { Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef, useEffect } from 'react';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});

const customIcon = L.icon({
  iconUrl: '/images/flag.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const MapComponent = ({ helpers, latitude, longitude }) => {
  const mapRef = useRef(null);
  let map = null; // Initialize map variable outside useEffect

  useEffect(() => {
    if (latitude && longitude) {
      if (mapRef.current) {
        // Check if a map instance already exists
        if (map) {
          map.remove(); // Remove the existing map
        }

        // Create a new map instance
        map = L.map(mapRef.current).setView([latitude, longitude], 13); 

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        helpers.forEach((helper) => {
          L.marker([helper.geocodes.main.latitude, helper.geocodes.main.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`${helper.name}<br />${helper.location.address || 'No address available'}`);
        });
      }
    }

    // Cleanup function
    return () => {
      if (map) {
        map.remove(); // Remove the map on unmount or dependency change
        map = null; // Reset the map variable
      }
    };
  }, [latitude, longitude, helpers]); 

  return (
    <div>
      <div ref={mapRef} style={{ height: '80vh', width: '100%' }} />
      {!latitude || !longitude ? <p>Loading map...</p> : null}
    </div>
  );
};

export default MapComponent;