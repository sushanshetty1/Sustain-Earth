"use client";
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../firebaseConfig';
import { FaSpinner } from 'react-icons/fa';

const HomePage = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "donationCollections"));
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
    loading ? (
      <div className="flex justify-center items-center mt-10 h-screen">
        <FaSpinner className="animate-spin text-4xl" />
      </div>
    ) : responses.length === 0 ? (
      <p>No responses available.</p>
    ) : (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-semibold mb-6 text-center">Discover Fundraisers</h1>
        <div className="grid gap-6 grid-cols-1 pt-16 md:grid-cols-2 lg:grid-cols-3">
          {responses.map((fundraiser, index) => (
            <div key={index} className="relative bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Image with overlay text */}
              <div className="relative">
                <img 
                  src={fundraiser.image || 'default-image.jpg'} 
                  alt={fundraiser.title} 
                  className="w-full h-64 object-cover" 
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {fundraiser.donations || 0} Donations
                </div>
              </div>
  
              {/* Title */}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{fundraiser.title || 'No title available'}</h2>
  
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 my-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${fundraiser.progress || 0}%` }}
                  ></div>
                </div>
  
                {/* Amount Raised */}
                <p className="text-lg font-semibold text-green-700">
                  ₹{fundraiser.amount || 0} raised of ₹{fundraiser.goal || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
}

export default HomePage;
