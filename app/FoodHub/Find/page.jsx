"use client";
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../../firebaseConfig';
import { FaSpinner } from 'react-icons/fa';

const Find = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);  // Add loading state
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "mealsCollection"));
        const fetchedResponses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setResponses(fetchedResponses);
        setLoading(false);  // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching responses: ", error);
        setLoading(false);  // Ensure loading state is false if there’s an error
      }
    };

    fetchResponses();
  }, [db]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        style={{
          fontFamily: '"Source Serif 4", Georgia, serif',
          letterSpacing: '-0.5px',
          lineHeight: '56px',
        }}
        className="w-[600px] h-[200px] text-[38px] font-normal text-center hidden lg:block mt-[100px]"
      >
        To those in need: We are here to help. Your struggles are not forgotten, and support is on the way.
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-10 h-screen">
          <FaSpinner className="animate-spin text-4xl" />
        </div>  // Display spinner while loading
      ) : responses.length === 0 ? (
        <p>No responses available.</p>
      ) : (
        <div className="ml-20 mt-10 mr-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {responses.map((response) => (
            <div
              key={response.id}
              className="p-4 bg-white rounded-lg border-2 border-transparent hover:border-black hover:scale-105 transition duration-300 ease-in-out shadow-lg"
            >
              {/* Use fields from Firebase data */}
              <div className="text-xl font-semibold text-gray-800">{response.name}</div>
              <p className="text-gray-600 mt-2">Meal Type: {response.mealType}</p>
              <p className="text-gray-600 mt-2">Meals: {response.meals}</p>
              <p className="text-gray-600 mt-2">
                Location: {response.location ? `${response.location.lat}, ${response.location.lon}` : 'Location not available'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Find;
