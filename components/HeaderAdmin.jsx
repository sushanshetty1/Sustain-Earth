"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Image from 'next/image';
import profilePic from '../public/images/profile.png';
import signOutPic from '../public/images/signout.png';
import Loader from './Loader';

function Header() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="flex flex-row justify-between items-center mt-4 ml-6 mr-6 sm:mb-3 mb-3">
        
        {/* Logo on the left */}
        <Link href="/">
          <button className="h-11 w-44 flex justify-center md:h-11">
            <Image src="/images/logo.png" alt="logo" width={150} height={50} />
          </button>
        </Link>

        {/* Profile and SignOut button */}
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center ml-2">
                <Link href="/DashBoard">
                  <Image
                    src={profilePic}
                    alt={userProfile?.firstName || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full profile-pic"  /* Added profile-pic class */
                  />
                </Link>
                <span className="ml-5 text-xl font-semibold wave-effect">
                  {userProfile?.firstName}
                </span>
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 mx-9 font-bold text-white rounded-full h-11 transition duration-400 bg-black hover:bg-gray-700 w-32 flex items-center justify-center space-x-2 "
              >
                <span className="sign-out-text">Sign Out</span>
                <Image
                  src={signOutPic}
                  alt="Sign Out"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </button>
            </div>
          ) : (
            <div className="w-40 h-12"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
