"use client"
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../../firebaseConfig';
import { FaSpinner } from 'react-icons/fa';

const Find = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching responses: ", error);
        setLoading(false);
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
        className="w-full sm:w-[600px] h-auto text-[28px] sm:text-[38px] font-normal text-center hidden lg:block mt-[100px] px-4"
      >
        To those in need: We are here to help. Your struggles are not forgotten, and support is on the way.
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-10 h-screen">
          <FaSpinner className="animate-spin text-4xl" />
        </div>
      ) : responses.length === 0 ? (
        <p>No responses available.</p>
      ) : (
        <div className="ml-4 sm:ml-20 mt-10 mr-4 sm:mr-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {responses.map((response) => (
            <div
              key={response.id}
              className="w-full sm:w-[300px] bg-white p-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              <div className="image_slot bg-gray-200 w-full h-[180px] sm:h-[200px] rounded-t-lg">
                {response.imageUrl ? (
                  <img 
                    src={response.imageUrl} 
                    alt="User uploaded" 
                    className="w-full h-full object-cover rounded-t-lg" 
                  />
                ) : (
                  <p className="text-gray-500 text-center pt-16">No image available</p>
                )}
              </div>
              <div className="uppercase text-sm font-semibold text-blue-600 pt-4">Meal Type: {response.mealType}</div>
              <div className="font-semibold text-gray-700 p-2 text-lg">
                {response.name}
                <div className="text-gray-500 font-normal text-sm pt-3">
                  Meals Available: <span className="font-semibold">{response.meals}</span><br />
                  Location: {response.location ? `${response.location.lat}, ${response.location.lon}` : 'Location not available'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Find;
