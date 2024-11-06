"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Header_FH from '@/components/Header_FH';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

const NearbyHelpersPage = () => {
  const [helpers, setHelpers] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching location:", error);
        setLocationError(error);
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const fetchFoursquareHelpers = async () => {
      if (latitude && longitude) {
        const url = `https://api.foursquare.com/v3/places/search?ll=${latitude},${longitude}&query=food&limit=10`;
        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY}`,
            },
          });
          if (response.data && response.data.results) {
            setHelpers(response.data.results);
          } else {
            console.error("Unexpected API response structure:", response.data);
          }
        } catch (error) {
          if (error.response) {
            console.error(
              "Error fetching data from Foursquare API:",
              error.response.data ? error.response.data : `Status ${error.response.status}`
            );
          } else if (error.request) {
            console.error("No response received from Foursquare API:", error.request);
          } else {
            console.error("Error setting up request to Foursquare API:", error.message);
          }
        }
        
      }
    };

    fetchFoursquareHelpers();
  }, [latitude, longitude]);

  if (isLoading) {
    return <p>Loading location...</p>;
  }

  if (locationError) {
    return (
      <div>
        <p>Error getting your location: {locationError.message}</p>
      </div>
    );
  }

  return (
    <div>
      <Header_FH />
      {latitude && longitude ? (
        <MapComponent helpers={helpers} latitude={latitude} longitude={longitude} />
      ) : (
        <p>Loading map based on your location...</p>
      )}
    </div>
  );
};

export default NearbyHelpersPage;
