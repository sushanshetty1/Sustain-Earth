"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Image from 'next/image';
import img from '../public/images/logo.jpg';
import profilePic from '../public/images/profile.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
    });

    return () => unsubscribe();
  }, [auth]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <div className="flex flex-row justify-center lg:justify-around items-center mt-12 ml-6 mr-6 sm:mb-3 mb-3">
      <div className="lg:flex w-screen lg:justify-evenly h-7 items-center">
        <div className='lg:flex hidden justify-around gap-5'>
          <Link href={'/FoodHub'}>
            <button
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className="text-lg rounded-lg w-20 font-bold text-gray-500 hover:text-black ease-in-out transition duration border-rad"
            >
              FoodHub
            </button>
          </Link>
          <button
            style={{ fontFamily: '"Josefin Sans", sans-serif' }}
            className="text-lg rounded-lg font-bold text-gray-500 hover:text-black transition duration-300 border-rad"
          >
            Learn & Share
          </button>
          <button
            style={{ fontFamily: '"Josefin Sans", sans-serif' }}
            className="text-lg rounded-lg font-bold text-gray-500 hover:text-black transition duration-300 border-rad"
          >
            MarketPlace
          </button>
        </div>
        <Link href={'/'}>
          <button className="h-11 lg:w-54 flex justify-center md:h-11 w-44">
            <Image src={img} alt="logo" width={150} height={50} />
          </button>
        </Link>
        <div className='lg:flex hidden justify-between gap-3'>
          <input
            type="search"
            placeholder="Search..."
            className="border border-gray-300 rounded-full p-2 w-48 focus:outline-none focus:border-green-500 py-1"
            aria-label="Search through site content"
          />
          {user ? (
            <div className="flex items-center gap-3">
              <Image
                src={profilePic}
                alt={userProfile?.username || 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="ml-2">{userProfile?.username}</span>
              <button
                onClick={handleSignOut}
                style={{ fontFamily: '"Josefin Sans", sans-serif' }}
                className="text-lg rounded-lg w-20 font-bold text-gray-500 hover:text-black ease-in-out transition duration border-rad"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link href={'/Login'}>
                <button
                  style={{ fontFamily: '"Josefin Sans", sans-serif' }}
                  className="text-lg rounded-lg w-20 font-bold text-gray-500 hover:text-black ease-in-out transition duration border-rad"
                >
                  Log in
                </button>
              </Link>
              <Link href={'/SignUp'}>
                <button
                  style={{ fontFamily: '"Josefin Sans", sans-serif' }}
                  className="text-lg rounded-lg w-20 font-bold text-gray-500 hover:text-black ease-in-out transition duration border-rad"
                >
                  Signup
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
      <button onClick={toggleMenu} className="lg:hidden focus:outline-none pt-3">
        <svg
          className="w-8 h-8 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-20 h-screen left-0 w-full bg-white z-10 shadow-lg lg:hidden">
          <div className="flex flex-col items-center py-4 space-y-4">
            <button
              onClick={closeMenu}
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
            >
              FoodHub
            </button>
            <button
              onClick={closeMenu}
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
            >
              Learn & Share
            </button>
            <button
              onClick={closeMenu}
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
            >
              MarketPlace
            </button>
            <Link href='/Login'>
              <button
                onClick={closeMenu}
                style={{ fontFamily: '"Josefin Sans", sans-serif' }}
                className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
              >
                Log in
              </button>
            </Link>
            <Link href='/SignUp'>
              <button
                onClick={closeMenu}
                style={{ fontFamily: '"Josefin Sans", sans-serif' }}
                className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
              >
                Signup
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
