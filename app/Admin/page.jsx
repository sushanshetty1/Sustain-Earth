'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'next/navigation';
import Header from '@/components/HeaderAdmin';

const Admin = () => {
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [professionalRequests, setProfessionalRequests] = useState([]);
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
        try {
          const teacherRequestsQuery = await getDocs(collection(db, 'teacherVerification'));
          const teacherRequestsData = teacherRequestsQuery.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setTeacherRequests(teacherRequestsData);
        } catch (error) {
          console.error("Error fetching teacher verification requests:", error);
        }
        try {
          const professionalRequestsQuery = await getDocs(collection(db, 'professionalVerification'));
          const professionalRequestsData = professionalRequestsQuery.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setProfessionalRequests(professionalRequestsData);
        } catch (error) {
          console.error("Error fetching professional verification requests:", error);
        }
      } else {
        setUserType(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApproval = async (userId, type) => {
    try {
      const userDocRef = doc(db, 'users', userId);
  
      await updateDoc(userDocRef, { type });
  
      if (type === 'Teacher') {
        const teacherRequestRef = doc(db, 'teacherVerification', userId);
        await deleteDoc(teacherRequestRef);
      } else if (type === 'Professional') {
        const professionalRequestRef = doc(db, 'professionalVerification', userId);
        await deleteDoc(professionalRequestRef);
      }
  
      alert(`User updated as ${type} successfully!`);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("There was an error updating the user.");
    }
  };
  

  const handleRejection = async (userId, requestType) => {
    try {
      if (requestType === 'Teacher') {
        const teacherRequestRef = doc(db, 'teacherVerification', userId);
        await deleteDoc(teacherRequestRef);
      } else if (requestType === 'Professional') {
        const professionalRequestRef = doc(db, 'professionalVerification', userId);
        await deleteDoc(professionalRequestRef);
      }

      alert("Request rejected and data erased successfully!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("There was an error rejecting the request.");
    }
  };

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
          <h1 className="text-3xl text-gray-700">Please log in to access the admin panel</h1>
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
    <div className="flex items-center justify-center h-screen mt-4 bg-[#f9f6f4]">
      <Header />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="mt-8">
          <h2 className="text-3xl font-semibold text-gray-800">Teacher Verification Requests</h2>
          <div className="mt-4">
            {teacherRequests.length === 0 ? (
              <p className="text-gray-600">No teacher verification requests available.</p>
            ) : (
              <div className="space-y-6">
                {teacherRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                    <h3 className="text-xl font-semibold text-gray-800">{request.teacherName}</h3>
                    <p className="mt-2 text-gray-600">School: {request.schoolName}</p>

                    <div className="mt-4">
                      <p className="font-medium">ID Card Images:</p>
                      <div className="mt-3 grid grid-cols-2 gap-6">
                        {request.frontCardImage && (
                          <div className="w-32 h-32 overflow-hidden rounded-lg shadow-sm">
                            <img
                              src={request.frontCardImage}
                              alt="Front Card"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {request.backCardImage && (
                          <div className="w-32 h-32 overflow-hidden rounded-lg shadow-sm">
                            <img
                              src={request.backCardImage}
                              alt="Back Card"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => handleApproval(request.id, 'Teacher')}
                        className="bg-black text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition duration-200"
                      >
                        ✔️
                      </button>
                      <button
                        onClick={() => handleRejection(request.id, 'Teacher')}
                        className="bg-black text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-200"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-gray-800">Professional Verification Requests</h2>
          <div className="mt-4">
            {professionalRequests.length === 0 ? (
              <p className="text-gray-600">No professional verification requests available.</p>
            ) : (
              <div className="space-y-6">
                {professionalRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                    <h3 className="text-xl font-semibold text-gray-800">{request.professionalName}</h3>
                    <p className="mt-2 text-gray-600">Organization: {request.organizationName}</p>

                    <div className="mt-4">
                      <p className="font-medium">ID Card Images:</p>
                      <div className="mt-3 grid grid-cols-2 gap-6">
                        {request.frontCardImage && (
                          <div className="w-32 h-32 overflow-hidden rounded-lg shadow-sm">
                            <img
                              src={request.frontCardImage}
                              alt="Front Card"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {request.backCardImage && (
                          <div className="w-32 h-32 overflow-hidden rounded-lg shadow-sm">
                            <img
                              src={request.backCardImage}
                              alt="Back Card"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => handleApproval(request.id, 'Professional')}
                        className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition duration-200"
                      >
                        ✔️
                      </button>
                      <button
                        onClick={() => handleRejection(request.id, 'Professional')}
                        className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-200"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
