"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, getFirestore, collection, getDocs } from 'firebase/firestore';
import {firebaseApp} from '../../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import Help from '../../../public/images/help.png';
import Image from 'next/image';

const DonationDetails = () => {
  const [user, setUser] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const path = usePathname();
  const donationId = path.split('/').pop();
  const db = getFirestore(firebaseApp);
  const [donationsList, setdonationList] = useState([]);

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

          const donationsCollectionRef = collection(donationRef, 'donations');
          const donationsSnapshot = await getDocs(donationsCollectionRef);
          const donationsListData = donationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).slice(0, 3); 

          setdonationList(donationsListData);
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
      <Image className="w-12 h-12 rounded-full object-cover" src={Help} alt="Help" />
      <span className="text-gray-800">{name}</span>
      <span className="text-gray-500 text-sm">₹{amount} • {note}</span>
    </div>
  );

  const handleDonate = () => (
    router.push(`/FoodHub/${donationId}/Donate`)
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("Link copied to clipboard!"))
      .catch(err => console.error("Failed to copy: ", err));
  };

  return (
    <div className="flex flex-col gap-8 w-full h-auto min-h-screen bg-[#f9f6f4] rounded-lg shadow-lg overflow-hidden p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 p-4">
        {donationData?.title}
      </h1>
      <div className="flex flex-col sm:flex-row w-full sm:max-w-screen-lg mx-auto">
        <div className="w-full sm:w-2/3 flex-col gap-9 flex justify-between pr-0 sm:pr-9">
          <img
            src={donationData?.image}
            alt="Fundraiser"
            className="w-full h-auto max-h-96 rounded-lg object-cover"
          />
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-gray-300">
              <img
                src={donationData?.admin}
                alt="Admin"
                className="w-full h-auto max-h-96 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Team SustainEarth</span>
            </div>
          </div>
          <div className="text-sm text-black">{donationData?.description}</div>
        </div>

        <div className="flex flex-col w-full sm:w-1/3 h-auto p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <p className="text-lg sm:text-xl font-semibold text-gray-800">
              ₹{donationData?.amount} raised
            </p>
            <p className="text-sm text-gray-500">
              ₹{(donationData?.goal / 1000).toFixed(1)}K goal • {(donationData?.donations / 1000).toFixed(1)}K donations
            </p>
            <ProgressBar amount={donationData?.amount} goal={donationData?.goal} />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <button onClick={handleShare} className="bg-yellow-400 text-white font-semibold py-2 rounded-xl w-full">
              Share
            </button>
            <button onClick={handleDonate} className="bg-yellow-500 text-white font-semibold py-2 rounded-xl w-full">
              Donate now
            </button>
          </div>

          <p className="text-purple-600 text-sm font-bold mb-4">
            {donationsList.length} people just donated
          </p>
          <div className="flex flex-col gap-3">
            {donationsList.slice(0, 3).map((donation, index) => (
              <DonationItem key={index} {...donation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetails;
