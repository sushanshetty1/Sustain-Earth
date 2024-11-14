import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = L.icon({
  iconUrl: '/images/flag.png',
  iconSize: [30, 30],
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

      console.log("Helpers:", helpers);

      helpers.forEach((helper) => {
        if (helper.location?.lat && helper.location?.lon) {
          console.log(`Adding marker for ${helper.name} at ${helper.location.lat}, ${helper.location.lon}`);

          const marker = L.marker([helper.location.lat, helper.location.lon], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center;">
                <img src="${helper.imageUrl}" alt="helper" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                <div><strong>${helper.name}</strong></div>
                <div>Meal Type: ${helper.mealType}</div>
                <div>Meals Available: ${helper.meals}</div>
                <div>Location: ${helper.location ? helper.location.address : 'Address not available'}</div>
              </div>
            `);

          let tooltip = null;
          marker.on('mouseover', () => {
            console.log(`Hovered over ${helper.name}`);
            tooltip = L.tooltip()
              .setContent(`
                <img src="${helper.imageUrl}" alt="helper" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" /><br>
                <strong>${helper.name}</strong><br>
                Meal Type: ${helper.mealType}<br>
                Meals Available: ${helper.meals}
              `)
              .setLatLng([helper.location.lat, helper.location.lon])
              .addTo(map);
          })
          .on('mouseout', () => {
            if (tooltip) {
              tooltip.remove();
            }
          });
        } else {
          console.warn(`Invalid or missing coordinates for helper: ${helper.name}`);
        }
      });

      return () => {
        map.remove();
      };
    }
  }, [latitude, longitude, helpers]);

  return <div id="map" style={{ height: '80vh', width: '100%' }} />;
};

export default MapComponent;
