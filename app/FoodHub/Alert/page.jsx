"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from '@/components/MapComponent';
import Header_FH from '@/components/Header_FH';

const NearbyHelpersPage = () => {
  const [helpers, setHelpers] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const fetchLocation = () => {
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
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchFoursquareHelpers = async () => {
      if (latitude && longitude) {
        const url = `https://api.foursquare.com/v3/places/search?ll=${latitude},${longitude}&query=food&limit=10`;
        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: process.env.FOURSQUARE_API_KEY, 
            },
          });
          setHelpers(response.data.results);
        } catch (error) {
          console.error("Error fetching data from Foursquare API:", error);
          // Handle API errors (e.g., display an error message to the user)
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
        {/* Optionally, provide a way for the user to enter their location manually */}
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