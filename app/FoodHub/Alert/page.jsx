"use client";

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { firebaseApp } from '../../../firebaseConfig';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
});

const NearbyHelpersPage = () => {
  const [helpers, setHelpers] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const db = getFirestore(firebaseApp);

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

  // Fetch helpers' data from Firestore
  useEffect(() => {
    const fetchHelpersFromDB = async () => {
      if (latitude && longitude) {
        try {
          const querySnapshot = await getDocs(collection(db, "mealsCollection"));
          const helpersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lat: doc.data().lat,
            lon: doc.data().lon,
          }));

          console.log("Fetched helpers:", helpersData);
          setHelpers(helpersData);
        } catch (error) {
          console.error("Error fetching helpers from Firestore: ", error);
        }
      }
    };

    fetchHelpersFromDB();
  }, [latitude, longitude, db]);

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
      {latitude && longitude ? (
        <MapComponent helpers={helpers} latitude={latitude} longitude={longitude} />
      ) : (
        <p>Loading map based on your location...</p>
      )}
    </div>
  );
};

export default NearbyHelpersPage;
