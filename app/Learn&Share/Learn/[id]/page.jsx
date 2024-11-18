"use client"
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, getFirestore, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import firebaseApp from '../../../../firebaseConfig';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';

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

       
        const newCount = interestedCount + 1;
        if (newCount % 4 === 0) {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const currentDate = new Date().toDateString();
                const userData = userDocSnap.data();
                let dailyBalance = userData.dailyBalance || 0;
                let balance = userData.balance || 0;
                const lastUpdated = userData.lastUpdated || null;

            if (lastUpdated !== currentDate) {
              dailyBalance = 0;
          }
           

            let newDailyBalance = dailyBalance + 20;
            let newBalance = balance;

            if (newDailyBalance > 250) {
              newDailyBalance = 250;
            } else {
              newBalance += 20;
            }

            await updateDoc(userRef, {
              dailyBalance: newDailyBalance,
              balance: newBalance,
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

      <div className="flex flex-col md:flex-row items-center w-full max-w-5xl">
        <img
          src={classData.imageUrl}
          alt="Class Image"
          className="w-full md:w-1/2 h-96 object-cover rounded-lg mb-4 md:mb-0"
        />

        <div className="flex flex-col ml-0 md:ml-6 space-y-4 text-left gap-6">
          <p><strong>Age Group:</strong> {classData.standard}</p>
          <p><strong>Class Type:</strong> {classData.classType}</p>
          <p><strong>Class Date:</strong> {classData.classDate}</p>

          <div className="flex items-center">
            <span className="text-xl font-semibold mr-3">Interested:</span>
            <Checkbox
              onChange={handleCheckboxChange} 
              checked={isInterested} />
            <span className="text-xl">{interestedCount} people are interested</span>
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