import { useState, useEffect } from 'react';
import { db, addDoc, collection, updateDoc, doc } from '../firebaseConfig';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
    };

    const handleError = (error) => {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          setError("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          setError("The request to get user location timed out.");
          break;
        default:
          setError("An unknown error occurred.");
      }
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess, 
      handleError, 
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0 
      }
    );
  }, []);

  return { location, error };
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

export async function saveRequestWithLocation(requestData, location) {
  try {
    // Add location to the request if available
    const completeRequestData = location 
      ? { 
          ...requestData, 
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      : requestData;

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'requests'), completeRequestData);
    return docRef;
  } catch (error) {
    console.error('Error saving request with location:', error);
    throw error;
  }
}