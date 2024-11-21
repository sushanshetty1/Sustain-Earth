"use client";
import React, { useState , useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile,fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import Logo from '../../public/images/logo-w.jpg';
import { useRouter } from 'next/navigation';
import {setDoc, doc } from 'firebase/firestore';
import Image from 'next/image';

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const provider = new GoogleAuthProvider();

  const signUpWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);

        if (signInMethods.includes('password')) {
            setError('An account already exists with this email. Please sign in using email.');
            return;
        }

        setEmail(user.email);
        setFirstName(user.displayName?.split(' ')[0] || '');
        setLastName(user.displayName?.split(' ')[1] || '');
        setShowAdditionalForm(true);
        setError(null);
    } catch (error) {
        setError(`Google Sign-Up Error: ${error.message}`);
        console.error(error);
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
        setError('Please fill out all required fields.');
        setLoading(false);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Signed up with email:', user);
        setShowAdditionalForm(true);
        setSuccess('Signed up successfully. Complete the profile!');
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            setError('The email address is already in use.');
        } else if (error.code === 'auth/weak-password') {
            setError('The password is too weak.');
        } else {
            setError(`Sign-Up Error: ${error.message}`);
        }
    } finally {
        setLoading(false);
    }
};

const handleAdditionalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!firstName || !lastName || !username) {
        setError('Please fill out all required fields.');
        setLoading(false);
        return;
    }

    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
        });

        await setDoc(doc(db, 'users', user.uid), {
            firstName,
            lastName,
            username,
            email: user.email,
            userId: user.uid,
            type: "Student",
        });

        setSuccess('User profile completed successfully!');
        console.log('User data stored successfully!');
        router.push('/');
    } catch (error) {
        setError(`Error storing user data: ${error.message}`);
        console.error('Firestore error:', error);
    } finally {
        setLoading(false);
    }
};

  
  const testFirestore = async () => {
    try {
      await setDoc(doc(db, 'testCollection', 'testDoc'), {
        testField: 'testValue'
      });
      console.log('Test document written successfully');
    } catch (error) {
      console.error('Error writing document:', error);
    }
  };
  
  testFirestore();

  return (
    <div className="flex sm:h-screen justify-center h-fit bg-gray-100">
      <div className="relative w-[30%] sm:inline-block hidden h-full">
        <video
          autoPlay
          loop
          muted
          className="object-cover w-full h-full absolute top-0 left-0"
        >
          <source
            src="https://cdn.dribbble.com/userupload/14870403/file/original-d4592d4cddfa59e3f760c477b88d86d7.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute top-4 left-4 z-10">
          <a href="/"> 
            <button>
              <Image src={Logo} alt="Logo" width={168} height={56} className="w-42 h-14 pt-3" />
            </button>
          </a>
        </div>
      </div>

      <div className="w-[70%] flex justify-center items-center bg-white">
        <div className="w-full max-w-md space-y-8 px-4 sm:px-6 lg:px-8 bg-white p-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-left text-gray-800">
              Sign up for SustainEarth
            </h1>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
          {showAdditionalForm ? (
            <form className="mt-8 space-y-6" onSubmit={handleAdditionalSubmit}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                  placeholder="First Name"
                />
              </div>

              <div className="pt-3">
                <label htmlFor="lastName" className="block text-sm font-bold text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)} 
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                  placeholder="Last Name"
                />
              </div>

              <div className="pt-3">
                <label htmlFor="username" className="block text-sm font-bold text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} 
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                  placeholder="Username"
                />
              </div>

              <div className="pt-3">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  readOnly
                  value={email} 
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex items-center justify-center font-bold py-2 px-4 h-12 text-sm rounded-full text-white bg-black ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {loading ? 'Completing profile...' : 'Complete Sign Up'}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className=" -space-y-px"> 
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={signUpWithGoogle}
                    className="group relative w-full flex gap-3 font-bold justify-center py-2 px-4 border border-gray-300 text-sm rounded-full text-gray-700 bg-white hover:bg-gray-50" 
                  >
                    <img src="https://img.icons8.com/fluency/24/google-logo.png" alt="Google" />
                    Sign up with Google
                  </button>
                </div>

                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500">or sign up with email</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                    placeholder="Email"
                  />
                </div>

                <div className="pt-3">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex items-center justify-center font-bold py-2 px-4 h-12 text-sm rounded-full text-white bg-black ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </div>

              <div className="text-center text-sm">
                Already have an account? <a href="/Login" className="text-indigo-600 font-medium hover:text-indigo-500">Sign in</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

