"use client";
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../firebaseConfig';
import { FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Loader from './loader';

const HomePage = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);
  const router = useRouter();

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

  // Handler to redirect to the donation details page
  const handleRedirect = (donationId) => {
    router.push(`/FoodHub/${donationId}`);
  };

  return (
    loading ? (
      <div className="flex bg-[#f9f6f4] justify-center items-center h-screen">
        <Loader />
      </div>
    ) : responses.length === 0 ? (
      <div className="flex justify-center items-center h-screen bg-[#f9f6f4]">
        <p className="text-lg font-medium">No responses available.</p>
      </div>
    ) : (
      <div className="p-8 bg-[#f9f6f4] min-h-screen">
        <h1 className="text-3xl font-semibold mb-10 text-center">
          Every Gift Counts – Join Us in Making a Change
        </h1>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {responses.map((fundraiser, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleRedirect(fundraiser.id)} // Redirect on click
            >
              {/* Image with overlay text */}
              <div className="relative">
                <img 
                  src={fundraiser.image || 'default-image.jpg'} 
                  alt={fundraiser.title} 
                  className="w-full h-64 object-cover" 
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {fundraiser.donations || 0} Donations
                </div>
              </div>

              {/* Title and Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3">{fundraiser.title || 'No title available'}</h2>
  
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
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
};

export default HomePage;
