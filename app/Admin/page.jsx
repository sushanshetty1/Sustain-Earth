'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'next/navigation';
import Header from '@/components/HeaderAdmin';

const Admin = () => {
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserType(docSnap.data().type);
          } else {
            console.error("No such document in Firestore!");
            setUserType(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserType(null);
        }
      } else {
        setUserType(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f9f6f4]">
        <div className="text-2xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (userType === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-semibold text-gray-800">Please log in to access the admin panel</h1>
          <p className="mt-4 text-gray-600">You need to log in to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (userType !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4 text-lg text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen  mt-4 bg-[#f9f6f4]">
      <Header />
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to the Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">This is your admin dashboard where you can manage everything.</p>
      </div>
    </div>
  );
};

export default Admin;
