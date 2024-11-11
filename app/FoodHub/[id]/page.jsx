"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import firebaseApp from '../../../firebaseConfig';
import { getAuth } from 'firebase/auth';

const DonationDetails = () => {
  const [user, setUser] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const path = usePathname();
  const donationId = path.split('/').pop();
  const db = getFirestore(firebaseApp);

  const donationsList = [
    { name: "Rocío Alba", amount: 25, note: "Recent donation" },
    { name: "Veronica Diaz Gonzalez", amount: 2000, note: "Top donation" },
    { name: "Nuria Casas Casado", amount: 200, note: "First donation" }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDonationData = async () => {
      if (donationId && user) {
        const donationRef = doc(db, 'donationCollections', donationId);
        const donationSnap = await getDoc(donationRef);

        if (donationSnap.exists()) {
          setDonationData({ id: donationSnap.id, ...donationSnap.data() });
        } else {
          router.push('/404');
        }
      }
    };

    fetchDonationData();
  }, [donationId, user]);

  if (!donationData) return <p>Loading...</p>;

  const ProgressBar = ({ amount, goal }) => (
    <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
      <div
        className="bg-green-500 h-4 rounded-full"
        style={{ width: `${(amount / goal) * 100}%` }}
      />
    </div>
  );

  const DonationItem = ({ name, amount, note }) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-800">{name}</span>
      <span className="text-gray-500 text-sm">€{amount} • {note}</span>
    </div>
  );

  const handleDonate = () => (
    router.push(`/FoodHub/${donationId}/donate`)
  );


  return (
    <div className="flex flex-col gap-8 w-full h-auto min-h-screen bg-white rounded-lg shadow-lg overflow-hidden">
      <h1 className="text-3xl font-bold text-center text-gray-800 p-4">
        {donationData?.title}
      </h1>
      <div className="flex flex-col lg:flex-row w-full lg:max-w-screen-lg mx-auto">
        {/* Left Section */}
        <div className="w-full lg:w-2/3 flex-col gap-9 flex justify-between pr-9">
          <img
            src={donationData?.image}
            alt="Fundraiser"
            className="w-full h-auto max-h-96 rounded-lg object-cover"
          />
          <div className="flex row gap-5">
            <div className="w-12 h-12 rounded-full bg-gray-300">
              <img
                src={donationData?.admin}
                alt="Admin"
                className="w-full h-auto max-h-96 rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Team SustainEarth</span>
              <p className="text-md text-black">{donationData?.description}</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col w-full lg:w-1/3 h-auto p-6 rounded-lg shadow-lg">
          {/* Fundraising Goal and Progress */}
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800">
              ₹{donationData?.amount} raised
            </p>
            <p className="text-sm text-gray-500">
              ₹{(donationData?.goal / 1000).toFixed(1)}K goal • {(donationData?.donations / 1000).toFixed(1)}K donations
            </p>
            <ProgressBar amount={donationData?.amount} goal={donationData?.goal} />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 mb-4">
            <button className="bg-yellow-400 text-white font-semibold py-2 rounded-xl w-full">
              Share
            </button>
            <button onClick={handleDonate} className="bg-yellow-500 text-white font-semibold py-2 rounded-xl w-full">
              Donate now
            </button>
          </div>

          {/* Recent Donations */}
          <p className="text-purple-600 text-sm font-bold mb-4">
            {donationsList.length} people just donated
          </p>
          <div className="flex flex-col gap-3">
            {donationsList.map((donation, index) => (
              <DonationItem key={index} {...donation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetails;
