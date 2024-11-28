'use client';
import Chart from './chart';
import Bar from './barchart';
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

  const handleApproval = async (userId, id, type) => {
    try {
      const userDocRef = doc(db, 'users', userId);
  
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        alert(`No user found with ID: ${userId}`);
        return;
      }
  
      await updateDoc(userDocRef, { type });
  
      if (type === 'Teacher') {
        const teacherRequestRef = doc(db, 'teacherVerification', id);
        await deleteDoc(teacherRequestRef);
      } else if (type === 'Professional') {
        const professionalRequestRef = doc(db, 'professionalVerification',id);
        await deleteDoc(professionalRequestRef);
      }
  
      alert(`User updated as ${type} successfully!`);
      window.location.reload();
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
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("There was an error rejecting the request.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f6f4]">
        <div className="text-3xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (userType === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f6f4]">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-lg text-gray-600">Please log in to access the admin panel</p>
        </div>
      </div>
    );
  }

  if (userType !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f6f4]">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f6f4] pb-12">
      <Header />
      <div className="container mx-auto px-4 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Teacher Verification Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Teacher Verification Requests
                </h2>
                <div className="space-y-6">
                  {teacherRequests.length === 0 ? (
                    <p className="text-lg text-gray-600 italic">No teacher verification requests available.</p>
                  ) : (
                    teacherRequests.map((request) => (
                      <div key={request.id} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{request.teacherName}</h3>
                        <p className="text-lg text-gray-700 mb-4">School: {request.schoolName}</p>

                        <div className="mb-6">
                          <p className="text-lg font-semibold text-gray-800 mb-3">ID Card Images:</p>
                          <div className="grid grid-cols-2 gap-4">
                            {request.frontCardImage && (
                              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={request.frontCardImage}
                                  alt="Front Card"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {request.backCardImage && (
                              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={request.backCardImage}
                                  alt="Back Card"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleApproval(request.userId, request.id, 'Teacher')}
                            className="flex-1 bg-black text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
                          >
                            Approve ✔️
                          </button>
                          <button
                            onClick={() => handleRejection(request.id, 'Teacher')}
                            className="flex-1 bg-black text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
                          >
                            Reject ❌
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Professional Verification Section */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Professional Verification Requests
                </h2>
                <div className="space-y-6">
                  {professionalRequests.length === 0 ? (
                    <p className="text-lg text-gray-600 italic">No professional verification requests available.</p>
                  ) : (
                    professionalRequests.map((request) => (
                      <div key={request.id} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{request.professionalName}</h3>
                        <p className="text-lg text-gray-700 mb-4">Organization: {request.organizationName}</p>

                        <div className="mb-6">
                          <p className="text-lg font-semibold text-gray-800 mb-3">ID Card Images:</p>
                          <div className="grid grid-cols-2 gap-4">
                            {request.frontCardImage && (
                              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={request.frontCardImage}
                                  alt="Front Card"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {request.backCardImage && (
                              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={request.backCardImage}
                                  alt="Back Card"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleApproval(request.userId, request.id, 'Professional')}
                            className="flex-1 bg-black text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
                          >
                            Approve ✔️
                          </button>
                          <button
                            onClick={() => handleRejection(request.id, 'Professional')}
                            className="flex-1 bg-black text-white text-lg font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
                          >
                            Reject ❌
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-lg md:p-6">
              <Chart />
            </div>
            <div className="bg-white rounded-xl shadow-lg md:p-6">
              <Bar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
