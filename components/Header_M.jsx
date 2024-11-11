"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Image from 'next/image';
import img from '../public/images/MarketPlace.png';
import { FaSpinner } from 'react-icons/fa';
import profilePic from '../public/images/profile.png';
import signOutPic from '../public/images/signout.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState(null); // Track active button
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Start loading
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
      setLoading(false); // End loading
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

  const handleButtonClick = (buttonIndex) => {
    setActiveButton(buttonIndex); // Update clicked button
  };

  return (
    <div className="flex flex-row justify-center lg:justify-around items-center mt-12 ml-6 mr-6 sm:mb-3 mb-3">
      <div className="lg:flex w-screen lg:justify-evenly h-7 items-center">
        
        {/* Desktop Navigation Links */}
        <div className="lg:flex hidden justify-around gap-6">
          <Link href="/MarketPlace/GreenMarket">
            <button
              onClick={() => handleButtonClick(0)} // Set active button index for GreenMarket
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className={`text-lg rounded-lg w-32 font-bold text-gray-500 hover:text-black ease-in-out transition duration border-rad  
                ${activeButton === 0 ? 'px-2 py-2 border-2 border-purple-500 bg-purple-500 text-white' : ''}`}
            >
              GreenMarket
            </button>
          </Link>
          <Link href={"/MarketPlace/SellNRent"}>
            <button
              onClick={() => handleButtonClick(1)} // Set active button index for Sell/Rent
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className={`text-lg rounded-lg font-bold text-gray-500 hover:text-black transition duration-300 border-rad
                ${activeButton === 1 ? 'px-2 py-2 border-2 border-purple-500 bg-purple-500 text-white' : ''}`}
            >
              Sell/Rent
            </button>
          </Link>
          <Link href="/MarketPlace/QuickAsk">
            <button
              onClick={() => handleButtonClick(2)} // Set active button index for QuickAsk
              style={{ fontFamily: '"Josefin Sans", sans-serif' }}
              className={`text-lg rounded-lg font-bold text-gray-500 hover:text-black transition duration-300 border-rad
                ${activeButton === 2 ? 'px-2 py-2 border-2 border-purple-500 bg-purple-500 text-white' : ''}`}
            >
              QuickAsk
            </button>
          </Link>
        </div>

        {/* Logo */}
        <Link href="/">
          <button className="h-11 lg:w-54 flex justify-center md:h-11 w-44">
            <Image src={img} alt="logo" width={150} height={50} />
          </button>
        </Link>

        {/* Desktop Profile and Search */}
        <div className="lg:flex hidden justify-between gap-3 items-center">
          {loading ? (
            // Loader Spinner while loading
            <FaSpinner className="text-gray-500 animate-spin" size={24} />
          ) : user ? (
            // Profile Info if user is logged in
            <div className="flex items-center gap-3">
              <span className="flex items-center ml-2">
                <Image
                  src={profilePic}
                  alt={userProfile?.firstName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="ml-5 text-xl font-semibold wave-effect">{userProfile?.firstName}</span>
              </span>

              <button
                onClick={handleSignOut}
                style={{ fontFamily: '"Josefin Sans", sans-serif' }} 
                className="px-3 py-2 mx-9 font-bold text-white rounded-full h-11 transition duration-400 bg-black hover:bg-gray-700 w-32 flex items-center justify-center space-x-2"
              >
                <span>Sign Out</span>
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
            // Login and Signup if no user is logged in
            <>
              <Link href="/Login">
                <button
                  style={{ fontFamily: '"Josefin Sans", sans-serif' }}
                  className="text-lg rounded-lg w-20 font-bold text-gray-500 hover:text-black ease-in-out transition duration border-rad"
                >
                  Log in
                </button>
              </Link>
              <Link href="/SignUp">
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

      {/* Mobile Menu Toggle Button */}
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-28 h-screen w-screen left-0  bg-white z-10 shadow-lg lg:hidden">
          <div className="flex flex-col items-center py-4 space-y-4">
            <Link href="/MarketPlace/GreenMarket">
              <button onClick={closeMenu} className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300">
                GreenMarket
              </button>
            </Link>
            <Link href="/MarketPlace/SellNRent">
              <button onClick={closeMenu} className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300">
                Sell/Rent
              </button>
            </Link>
            <Link href="/MarketPlace/QuickAsk">
              <button onClick={closeMenu} className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300">
                QuickAsk
              </button>
            </Link>
            {user ? (
              <button
                onClick={() => { closeMenu(); setUser(null); }}
                className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link href="/Login">
                  <button
                    onClick={closeMenu}
                    className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
                  >
                    Log in
                  </button>
                </Link>
                <Link href="/SignUp">
                  <button
                    onClick={closeMenu}
                    className="text-lg w-full text-center font-bold text-gray-500 hover:text-black transition duration-300"
                  >
                    Signup
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
