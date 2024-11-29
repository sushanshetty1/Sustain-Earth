"use client"
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc, getFirestore, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {firebaseApp} from '../../../../firebaseConfig';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';
import { Calendar, Users, Star, Clock, Mail, MessageSquare, Heart, Award } from 'lucide-react';
import ReactStars from 'react-stars'
import Loader from './loader';

const ClassDetail = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const path = usePathname();
  const classId = path.split('/').pop();
  const [classData, setClassData] = useState(null);
  const [proctorData, setProctorData] = useState(null);
  const [interestedCount, setInterestedCount] = useState(0);
  const [isInterested, setIsInterested] = useState(false);
  const db = getFirestore(firebaseApp);

  const [rating, setRating] = useState({
    userRating: 0,
    averageRating: 0,
    isSubmitting: false
  });

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
          const data = docSnap.data();
          setClassData(data);
          setInterestedCount(data.interestedUsers?.length || 0);
          setIsInterested(data.interestedUsers?.includes(user.uid) || false);

          if (data.procterId) {
            const proctorRef = doc(db, 'users', data.procterId);
            const proctorSnap = await getDoc(proctorRef);
            
            if (proctorSnap.exists()) {
              const proctorInfo = proctorSnap.data();
              setProctorData(proctorInfo);

              if (proctorInfo.ratings) {
                const ratings = Object.values(proctorInfo.ratings);
                const avg = ratings.length > 0 
                  ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
                  : 0;
                
                setRating({
                  userRating: proctorInfo.ratings[user.uid] || 0,
                  averageRating: Number(avg.toFixed(1)),
                  isSubmitting: false
                });
              }
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
           

          const checkboxHistory = userData.checkboxHistory || {};
          if (!checkboxHistory[classId]) {
            if (dailyBalance < 250) {
              const remainingBalance = 250 - dailyBalance;
              const increment = Math.min(10, remainingBalance);
              dailyBalance += increment;
              balance += increment;
  
              await updateDoc(userRef, {
                dailyBalance,
                balance,
                lastUpdated: currentDate,
                checkboxHistory: {
                  ...checkboxHistory,
                  [classId]: true,
                },
              });
            }
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

  const handleRatingChange = async (newRating) => {
    if (!user) {
      alert("Please log in to rate the proctor!");
      return;
    }

    if (!proctorData || !classData?.procterId) {
      console.error("Missing proctor data or ID");
      return;
    }

    setRating(prev => ({ ...prev, isSubmitting: true }));

    try {
      const proctorRef = doc(db, 'users', classData.procterId);
      const proctorSnap = await getDoc(proctorRef);
      
      if (!proctorSnap.exists()) {
        throw new Error("Proctor document not found");
      }

      const currentRatings = proctorSnap.data().ratings || {};
      const newRatings = {
        ...currentRatings,
        [user.uid]: newRating
      };

      const ratingsArray = Object.values(newRatings);
      const newAverage = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;

      await updateDoc(proctorRef, {
        ratings: newRatings,
        averageRating: newAverage
      });

      setRating({
        userRating: newRating,
        averageRating: Number(newAverage.toFixed(1)),
        isSubmitting: false
      });

      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setRating(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const ProctorCard = ({ proctorData, db, user, classData }) => {
    const [ratingState, setRatingState] = useState({
      userRating: 0,
      averageRating: 0,
      isSubmitting: false
    });
  
    useEffect(() => {
      if (proctorData?.ratings) {
        const ratings = Object.values(proctorData.ratings);
        const avg = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
        
        setRatingState({
          userRating: user && proctorData.ratings[user?.uid] ? proctorData.ratings[user.uid] : 0,
          averageRating: Number(avg.toFixed(1)),
          isSubmitting: false
        });
      }
    }, [proctorData, user]);
  
    const handleRatingSubmit = async (newRating) => {
      if (!user) {
        alert("Please log in to rate the proctor!");
        return;
      }
  
      if (!proctorData || !classData?.procterId) {
        console.error("Missing proctor data or ID");
        return;
      }
  
      setRatingState(prev => ({ ...prev, isSubmitting: true }));
  
      try {
        const proctorRef = doc(db, 'users', classData.procterId);
        const proctorSnap = await getDoc(proctorRef);
        
        if (!proctorSnap.exists()) {
          throw new Error("Proctor document not found");
        }
  
        const currentRatings = proctorSnap.data().ratings || {};
        const newRatings = {
          ...currentRatings,
          [user.uid]: newRating
        };
  
        const ratingsArray = Object.values(newRatings);
        const newAverage = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
  
        await updateDoc(proctorRef, {
          ratings: newRatings,
          averageRating: newAverage
        });
  
        if (classData.id) {
          const classRef = doc(db, 'classesCollection', classData.id);
          await updateDoc(classRef, {
            proctorRating: newAverage
          });
        }
  
        setRatingState({
          userRating: newRating,
          averageRating: Number(newAverage.toFixed(1)),
          isSubmitting: false
        });
  
      } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Failed to submit rating. Please try again.");
        setRatingState(prev => ({ ...prev, isSubmitting: false }));
      }
    };
  
    if (!proctorData) return null;
  
    return (
      <div className="font-['Inter'] w-full max-w-4xl mx-auto mt-12 mb-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Proctor Details</h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8 pb-8 border-b border-gray-100">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-blue-100">
                <Image 
                  src={proctorData.profilePic || '/deaf.png'} 
                  alt="Proctor Image" 
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  onError={(e) => {e.currentTarget.src = '/deaf.png'}}
                />
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {proctorData.firstName} {proctorData.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {proctorData.type}
                    </span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Join Class</span>
                </button>
              </div>
            </div>
          </div>
  
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600 font-medium">Students Taught</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{proctorData.studentsCount || '250+'}</p>
            </div>*/}
            
            <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600 font-medium">Classes Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{proctorData.numberOfTeaching || '0'}</p>
            </div> 
            
            <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600 font-medium">Rating</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-800">{ratingState.averageRating}</p>
                  <ReactStars
                    count={5}
                    value={ratingState.averageRating}
                    size={24}
                    color2={'#ffd700'}
                    edit={false}
                    half={true}
                  />
                </div>
                {user && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Your Rating:</p>
                    <ReactStars
                      count={5}
                      onChange={handleRatingSubmit}
                      size={24}
                      value={ratingState.userRating}
                      half={true}
                      color2={'#ffd700'}
                      disabled={ratingState.isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* Bio Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">About Me</h3>
            <p className="text-gray-600 leading-relaxed">
              {proctorData.bio || "Experienced educator passionate about making learning accessible and enjoyable for all students. Specialized in creating inclusive learning environments and adapting teaching methods to individual needs."}
            </p>
          </div>
  
          {/* Teaching Philosophy */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Heart className="w-5 h-5 text-blue-600" />
              Teaching Philosophy
            </h3>
            <p className="text-gray-600">
              {proctorData.philosophy || "Every student has unique potential. My role is to create an inclusive environment where all students can thrive and achieve their learning goals."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!classData) return <div className='min-h-screen flex items-center justify-center'><Loader/></div>;
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
        <div className="flex flex-col ml-0 md:ml-6 justify-between text-left gap-6">
          <div className="mt-4 space-y-4">
            <p className="flex items-center gap-3 text-base">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"/></svg>
              <strong>Age Group:</strong> {classData.standard}
            </p>
            <p className="flex items-center gap-3 text-base">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
              <strong>Date:</strong> {classData.classDate}
            </p>
            <p className="flex items-center gap-3 text-base">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z"/></svg>
              <strong>Time:</strong> {classData.classTime}
            </p>
            <p className="flex items-center gap-3 text-base">
              <a href={classData.classLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2854C5"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z"/></svg>
                Join Google Meet
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">Interested:</span>
            <Checkbox onChange={handleCheckboxChange} checked={isInterested} />
            <span className="text-base">{interestedCount} people are interested</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-semibold">Rate The Class:</span>
            {user && (
              <div className="flex items-center ml-2">
                <ReactStars
                  count={5}
                  onChange={handleRatingChange}
                  size={24}
                  value={rating.userRating}
                  half={true}
                  color2={'#ffd700'}
                  disabled={rating.isSubmitting}
                />
              </div>
            )}
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
      <ProctorCard proctorData={proctorData} />
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
  //here we need to change    
.rating:not(:checked) > input {
  position: absolute;
  appearance: none;
}

.rating:not(:checked) > label {
  float: right;
  cursor: pointer;
  font-size: 30px;
  color: #666;
}

.rating:not(:checked) > label:before {
  content: '★';
}

.rating > input:checked + label:hover,
.rating > input:checked + label:hover ~ label,
.rating > input:checked ~ label:hover,
.rating > input:checked ~ label:hover ~ label,
.rating > label:hover ~ input:checked ~ label {
  color: #e58e09;
}

.rating:not(:checked) > label:hover,
.rating:not(:checked) > label:hover ~ label {
  color: #ff9e0b;
}

.rating > input:checked ~ label {
  color: #ffa723;
}

  }`
;




export default ClassDetail;
