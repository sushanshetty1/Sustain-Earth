"use client"
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, getFirestore, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {firebaseApp} from '../../../../firebaseConfig';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';
import {HeartFilled, Clock, Calendar, People, Video, Star, StarHalf, Mail } from "lucide-react";

const ClassDetail = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth(firebaseApp);
  const [rating, setRating] = useState(0);
  const [proctorData, setProctorData] = useState(null);
  const router = useRouter();
  const path = usePathname();
  const [userRating, setUserRating] = useState(null);
  const classId = path.split('/').pop();
  const [classData, setClassData] = useState(null);
  const [interestedCount, setInterestedCount] = useState(0);
  const [isInterested, setIsInterested] = useState(false); 
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user); 
      } else {
        setUser(null); 
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchClassData = async () => {
      if (classId && user) { 
        const classRef = doc(db, 'classesCollection', classId);
        const docSnap = await getDoc(classRef);

        if (docSnap.exists()) {
          const classData = docSnap.data();
          setClassData(classData);
          setInterestedCount(classData.interestedUsers ? classData.interestedUsers.length : 0);
          setIsInterested(classData.interestedUsers?.includes(user.uid) || false); 

          if (classData.procterId) {
            const proctorRef = doc(db, 'users', classData.procterId);
            const proctorSnap = await getDoc(proctorRef);
            if (proctorSnap.exists()) {
              setProctorData(proctorSnap.data());
              setUserRating(proctorInfo.ratings?.[user?.uid] || null);
            }
          }
        } else {
          router.push('/404');
        }
      }
    };

    fetchClassData();
  }, [classId, db, router, user]); 

  const handleCheckboxChange = async () => {
    if (!user) {
      alert("Please log in to show your interest!");
      return;
    }

    const newInterestedState = !isInterested;
    const classRef = doc(db, 'classesCollection', classId);
    const userRef = doc(db, "users", user.uid);

    try {
      if (newInterestedState) {
        await updateDoc(classRef, {
          interestedUsers: arrayUnion(user.uid)
        });
        setInterestedCount(prevCount => prevCount + 1);
          
                            
        // const newCount = interestedCount + 1;
        // if (newCount % 4 === 0) {

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const currentDate = new Date().toDateString();
          const userData = userDoc.data();
          let dailyBalance = userData.dailyBalance || 0;
          let balance = userData.balance || 0;
          const lastUpdated = userData.lastUpdated || null;

          if (lastUpdated !== currentDate) {
            dailyBalance = 0;
          }
           

          let newDailyBalance = dailyBalance;
          let newBalance = balance;
          if (newDailyBalance < 250) {
            const remainingBalance = 250 - newDailyBalance;
            const increment = Math.min(10, remainingBalance); // Only add up to 10 or the remaining amount
            newDailyBalance += increment;
  
            if (newDailyBalance <= 250) {
              newBalance += increment; // Add to the balance
            }
          }
  
          // If dailyBalance is less than 250, update the Firestore
          if (newDailyBalance > dailyBalance) {
            await updateDoc(userRef, {
              dailyBalance: newDailyBalance,
              balance: newBalance,
              lastUpdated: currentDate, // Update the lastUpdated field to the current day
            });
          }
        }
  
      } else {
        await updateDoc(classRef, {
          interestedUsers: arrayRemove(user.uid)
        });
        setInterestedCount(prevCount => prevCount - 1);
      }
  
      setIsInterested(newInterestedState);

    } catch (error) {
      console.error("Error updating Firestore:", error);
      setIsInterested(!newInterestedState);
    }
  };

  const handleRatingSubmit = async () => {
    if (!user) {
      alert("Please log in to rate the proctor!");
      return;
    }

    try {
      const proctorRef = doc(db, 'users', classData.procterId);
      await updateDoc(proctorRef, {
        ratings: {
          ...(proctorData.ratings || {}),
          [user.uid]: rating,
        },
      });

      alert("Rating submitted successfully!");
      setUserRating(rating);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating.");
    }
  };

  if (!classData) return <p>Loading...</p>;
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8 bg-[#f9f6f4] text-gray-900">
      <h1 className="text-5xl font-bold text-center mb-6 text-gray-800 tracking-wide">
        {classData.className}
      </h1>
\
      <div className="flex flex-col md:flex-row items-center w-full max-w-5xl">
        <img
          src={classData.imageUrl}
          alt="Class Image"
          className="w-full md:w-1/2 h-96 object-cover rounded-lg mb-4 md:mb-0"
        />

        <div className="flex flex-col ml-0 md:ml-6 justify-between text-left gap-6">
          <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2">
                <i className="h-4 w-4" /> <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"/></svg><strong>Age Group:</strong> {classData.standard}
              </p>
              <p className="flex items-center gap-2">
                <i className="h-4 w-4" /> <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg><strong>Date:</strong> {classData.classDate}
              </p>
              <p className="flex items-center gap-2">
                <i className="h-4 w-4" /><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/></svg><strong>Time: </strong> {classData.classTime}
              </p>
              <p className="flex items-center gap-2">
              <a
                href="https://meet.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <i className="h-4 w-4" />
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2854C5"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z"/></svg> Join Google Meet
              </a></p>

          <div className="flex items-center">
            <span className="text-xl font-semibold mr-3">Interested:</span>
            <Checkbox
              onChange={handleCheckboxChange} 
              checked={isInterested} />
            <span className="text-xl">{interestedCount} people are interested</span>
          </div>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-5xl text-left">
        <h3 className="text-2xl font-bold mb-2">Description</h3>
        <p className="text-lg text-gray-700">{classData.description}</p>
      </div>

      <div className="mt-8 w-full max-w-5xl text-left">
        <h3 className="text-2xl font-bold mb-2">What You Will Learn</h3>
        <ul className="list-disc pl-6 text-lg">
          {classData.whatYouWillLearn.map((item, idx) => (
            <li key={idx} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 w-full max-w-5xl text-left">
        <h3 className="text-2xl font-bold mb-2">Minimum Requirements</h3>
        <ul className="list-disc pl-6 text-lg">
          {classData.minimumRequirements.map((req, idx) => (
            <li key={idx} className="text-gray-700">{req}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 w-full max-w-5xl text-left">
        <h3 className="text-2xl font-bold mb-2">Google Meet Link</h3>
        <a href={classData.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          Join Meeting
        </a>
      </div>
      {proctorData && (
        <>
        <h1 className="text-2xl font-bold mb-2">Proctor Details</h1>
        <div className="bg-gray-900 flex flex-col gap-8 text-white p-6 rounded-lg border h-80 border-gray-700 w-96">
          <div className="flex items-center mb-4">
          <div className="w-20 h-20 bg-gray-700 rounded-full mr-4 relative overflow-hidden">
            <Image 
              src={proctorData.profilePic || './deaf.png'} 
              alt="Proctor Image" 
              width={80} 
              height={80} 
              className="rounded-full object-cover"
              style={{ width: '100%', height: '100%' }}
              onError={(e) => (e.target.src = './deaf.png')}
            />
          </div>


            <div className="">
              <p className="text-lg font-semibold">{proctorData.firstName}</p>
            </div>
            <button className="ml-auto bg-gray-700 py-1 px-7 rounded-lg">
              {proctorData.type}
            </button>
          </div>
          
          <p className="bg-transparent placeholder-gray-400 text-white  border-gray-600 w-full mb-4">
            {proctorData.bio}
          </p>
          
          <p className="rating bg-transparent placeholder-gray-400 text-white  border-gray-600 w-full mb-4">
            {proctorData.email}
          </p>
          <div className="bg-gray-700 py-2 px-6 self-end ml-36 rounded-lg h-8 w-1/4">
            
          </div>
      </div>
      </>
      )}
    </div>
  );
};


const Checkbox = ({ onChange, checked, disabled }) => {
  return (
    <StyledWrapper>
      <div className="heart-container" title="Like">
        <input type="checkbox" className="checkbox" id="Give-It-An-Id" onChange={onChange} checked={checked} disabled={disabled} />
        <div className="svg-container">
          <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
          </svg>
          <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
};
const StyledWrapper = styled.div`
  .heart-container {
    --heart-color: rgb(255, 91, 137);
    position: relative;
    width: 40px; /* Slightly larger size */
    height: 40px;
    transition: transform 0.2s ease-in-out;
  }

  .heart-container .checkbox {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 20;
    cursor: pointer;
  }

  .heart-container .svg-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .heart-container .svg-outline,
          .heart-container .svg-filled {
    fill: var(--heart-color);
    position: absolute;
    width: 28px; /* Adjusted for consistency */
    height: 28px; /* Adjusted for consistency */
  }

  .heart-container .svg-filled {
    animation: keyframes-svg-filled 1s;
    display: none;
  }

  .heart-container .svg-celebrate {
    position: absolute;
    animation: keyframes-svg-celebrate .5s;
    animation-fill-mode: forwards;
    display: none;
    stroke: var(--heart-color);
    fill: var(--heart-color);
    stroke-width: 1.5px;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-filled {
    display: block;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-celebrate {
    display: block;
  }

  .heart-container:hover {
    transform: scale(1.1); /* Add hover effect for better interactivity */
  }

  @keyframes keyframes-svg-filled {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes keyframes-svg-celebrate {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.5);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }`
;




export default ClassDetail;