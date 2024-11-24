"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, getDocs, getFirestore, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../../../firebaseConfig';
import Link from 'next/link';
import './Classes/SharedStyles.css';
import Loader from '../loader';
import { LockIcon } from 'lucide-react';

const Home = () => {
  const [allClasses, setAllClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [userIsPremium, setUserIsPremium] = useState(false);
  const [userId, setUserId] = useState(null);
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  // Check user's premium status whenever userId changes
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!userId) {
        setUserIsPremium(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const newPremiumStatus = userDoc.data().premium || false;
          setUserIsPremium(newPremiumStatus);
          // Only refilter if not on premium tab
          if (activeTab !== 'premium') {
            filterClasses(allClasses, activeTab, newPremiumStatus);
          }
        } else {
          setUserIsPremium(false);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        setUserIsPremium(false);
      }
    };

    checkPremiumStatus();
  }, [userId, db, activeTab, allClasses]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setUserIsPremium(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const deleteExpiredClasses = async (classes) => {
    const now = new Date();
    const deletionPromises = classes
      .filter(classItem => {
        const classDate = new Date(classItem.classDate);
        const [hours, minutes] = classItem.classTime.split(':');
        classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return classDate < now;
      })
      .map(classItem => deleteDoc(doc(db, 'classesCollection', classItem.id)));

    await Promise.all(deletionPromises);
  };

  useEffect(() => {
    const fetchClassesData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'classesCollection'));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        await deleteExpiredClasses(data);
        
        const updatedSnapshot = await getDocs(collection(db, 'classesCollection'));
        const updatedData = updatedSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        setAllClasses(updatedData);
        filterClasses(updatedData, activeTab, userIsPremium);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
      }
    };

    fetchClassesData();

    const interval = setInterval(fetchClassesData, 60000);
    return () => clearInterval(interval);
  }, [db]);

  const filterClasses = (classes, tab, isPremium) => {
    if (!classes) return;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    let filtered;
    
    switch (tab) {
      case 'premium':
        filtered = classes.filter(classItem => classItem.isPremium);
        break;
      case 'recent': {
        filtered = classes.filter(classItem => {
          const classDate = new Date(classItem.classDate);
          classDate.setHours(0, 0, 0, 0);
          const isAccessible = !classItem.isPremium || isPremium;
          return classDate >= today && classDate <= dayAfterTomorrow && isAccessible;
        });
        break;
      }
      case 'upcoming': {
        filtered = classes.filter(classItem => {
          const classDate = new Date(classItem.classDate);
          classDate.setHours(0, 0, 0, 0);
          const isAccessible = !classItem.isPremium || isPremium;
          return classDate > dayAfterTomorrow && isAccessible;
        });
        break;
      }
      default:
        filtered = classes;
    }

    setFilteredClasses(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterClasses(allClasses, tab, userIsPremium);
  };

  const handleUpgradeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '/DashBoard';
  };

  const ClassCard = ({ classData }) => {
    const isPremiumClass = classData.isPremium;
    const canAccess = !isPremiumClass || userIsPremium;

    return (
      <Link href={canAccess ? `/Learn&Share/Learn/${classData.id}` : "#"}>
        <div className="article-wrapper relative">
          <div className="container-project relative">
            {classData.imageUrl && (
              <>
                <img 
                  src={classData.imageUrl} 
                  alt="Class Image" 
                  className={`w-full h-full object-cover rounded-t-md ${!canAccess ? 'blur-sm' : ''}`}
                />
                {!canAccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-t-md">
                    <LockIcon className="w-8 h-8 text-white mb-2" />
                    <span className="text-white font-semibold">Premium Content</span>
                    <button 
                      onClick={handleUpgradeClick}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="project-info">
            <div className="flex-pr">
              <div className="project-title text-left">{classData.className}</div>
              <div className="project-hover">
                <svg style={{ color: 'black' }} xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor">
                  <line x1={5} y1={12} x2={19} y2={12} />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
            <div className="text-center text-black">{classData.classDate}</div>
            <div className="types flex gap-2 justify-center">
              <span style={{ backgroundColor: 'rgba(165, 96, 247, 0.43)', color: 'rgb(85, 27, 177)' }} className="project-type">• {classData.classType}</span>
              <span className="project-type">• {classData.standard}</span>
              {isPremiumClass && (
                <span className="project-type bg-yellow-200 text-yellow-800">• Premium</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="text-white min-h-screen p-6 font-sans">
      <header className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-16">
        <div className="md:ml-[180px] mt-10 md:w-1/2 mb-8 md:mb-0">
          <p className="text-3xl md:text-4xl w-fit font-bold mb-4 text-black">
            "Unlock Your Learning <br/><span className='ml-0 lg:ml-48'>Potential Today"</span>
          </p>
          <p className="text-base md:text-lg mb-6 text-black">
            Explore a world of knowledge, master new skills, and achieve your academic goals with expert guidance and interactive resources designed for you.
          </p>
          <Link href="/Learn&Share/Learn/Classes">
            <button className="border border-black text-black px-6 py-2 hover:bg-white hover:text-black transition duration-200 text-sm md:text-base">
              Get Involved
            </button>
          </Link>
        </div>
        <div className="md:w-1/3 mt-8 md:mt-0">
          <Image src="/images/study-image.jpg" alt="Books and study materials" width={370} height={250} className="rounded-lg shadow-lg mx-auto" />
        </div>
      </header>

      <section className="text-center">
        <h2 className="text-xl md:text-2xl mb-4 text-black">
          Explore our platform to gain knowledge and enhance your skills.
        </h2>
        <nav className="flex justify-center space-x-6 mb-8 text-gray-400">
          {['recent', 'upcoming', 'premium'].map((tab) => (
            <button 
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-1 border-b-2 capitalize ${
                activeTab === tab 
                  ? 'text-black border-red-500' 
                  : 'border-transparent hover:text-black'
              } transition-all ease-out duration-500`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex justify-center items-center h-[13em]">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {filteredClasses.map((classData) => (
              <ClassCard key={classData.id} classData={classData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;