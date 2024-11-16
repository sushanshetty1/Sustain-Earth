"use client";
import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Image from 'next/image';
import Logo from '../../public/images/logo-w.jpg';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setSuccess('Successfully signed in with Google!');
      router.push('/');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Successfully signed in with email!');
      router.push('/');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-fit md:h-screen justify-center bg-gray-100">
      {/* Left 30% div for video */}
      <div className="w-[30%] hidden md:inline-block h-full relative">
        {videoLoading && (
          <div className="flex justify-center items-center w-full h-full absolute top-0 left-0 bg-black bg-opacity-50">
            <FaSpinner className="text-white text-4xl animate-spin" />
          </div>
        )}
        <video 
          autoPlay 
          loop 
          muted 
          onCanPlay={() => setVideoLoading(false)}
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
              Sign in to SustainEarth
            </h1>
          </div>
  
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
  
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="group relative w-full flex gap-3 font-bold justify-center py-2 px-4 border border-gray-300 text-sm rounded-full text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Image src="https://img.icons8.com/fluency/24/google-logo.png" alt="Google logo" width={24} height={24} />
                  {loading ? 'Loading...' : 'Sign in with Google'}
                </button>
              </div>
  
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">or sign in with email</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
  
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                  Username or Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Username or Email"
                />
              </div>
  
              <div className='pt-3'>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Password"
                />
              </div>
            </div>
  
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>
  
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center font-bold py-2 px-4 h-12 border border-transparent text-sm rounded-full text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            </div>
  
            <div className="text-center text-sm">
              Don’t have an account? <a href="/SignUp" className="text-indigo-600 font-medium hover:text-indigo-500">Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
