"use client";
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../firebaseConfig';
import { useRouter } from 'next/navigation';
import Loader from './loader';

const ProgressBar = ({ amount, goal }) => (
  <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
    <div
      className="bg-green-500 h-4 rounded-full"
      style={{ width: `${(amount / goal) * 100}%` }}
    />
  </div>
);

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
          {responses.map((fundraiser) => (
            <div
              key={fundraiser.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleRedirect(fundraiser.id)}
            >
              <div className="relative">
                <img 
                  src={fundraiser.image || 'default-image.jpg'} 
                  alt={fundraiser.title || 'Untitled'} 
                  className="w-full h-64 object-cover" 
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {fundraiser.donations || 0} Donations
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3">
                  {fundraiser.title || 'No title available'}
                </h2>
                <ProgressBar amount={fundraiser.amount || 0} goal={fundraiser.goal || 100} />
                <p className="text-lg font-semibold text-green-700">
                  ₹{fundraiser.amount || 0} raised of ₹{fundraiser.goal || 100}
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
