"use client";

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  useEffect(() => {
    if (latitude && longitude) {
      const map = L.map('map').setView([latitude, longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      helpers.forEach((helper) => {
        L.marker([helper.geocodes.main.latitude, helper.geocodes.main.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`${helper.name}<br />${helper.location.address || 'No address available'}`);
      });

      // Cleanup the map instance on unmount
      return () => {
        map.remove();
      };
    }
  }, [latitude, longitude, helpers]);

  return <div id="map" style={{ height: '80vh', width: '100%' }} />;
};

export default MapComponent;
