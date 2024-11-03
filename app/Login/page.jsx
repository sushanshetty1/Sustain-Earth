"use client";
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Image from 'next/image'; // Import Image from next/image
import Logo from '../../public/images/logo-w.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in result:', result.user);
      setSuccess('Successfully signed in with Google!');
      // Redirect or update UI as needed
    } catch (error) {
      console.error('Error signing in with Google:', error.code, error.message);
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

    console.log('Attempting to sign in with:', email, password); // Debug log

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in with email:', userCredential.user);
      setSuccess('Successfully signed in with email!');
      // Handle successful login, e.g., redirect the user
    } catch (error) {
      console.error('Error signing in with email and password:', error.code, error.message); // Enhanced logging
      setError('Failed to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-fit md:h-screen justify-center w-screen bg-gray-100">
      {/* Left 30% div for video */}
      <div className="w-[30%] hidden md:inline-block h-full relative">
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
  
      {/* Right 70% div for login form */}
      <div className="w-[70%] flex justify-center items-center bg-white">
        <div className="w-full max-w-md space-y-8 px-4 sm:px-6 lg:px-8 bg-white p-8"> 
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-left text-gray-800">
              Sign in to SustainEarth
            </h1>
          </div>
  
          {/* Display error and success messages */}
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
  
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className=" -space-y-px">
              {/* Google Sign-In Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading} // Disable during loading
                  className="group relative w-full flex gap-3 font-bold justify-center py-2 px-4 border border-gray-300 text-sm rounded-full text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Image src="https://img.icons8.com/fluency/24/google-logo.png" alt="Google logo" width={24} height={24} />
                  {loading ? 'Loading...' : 'Sign in with Google'}
                </button>
              </div>
  
              {/* Or sign in with email section */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">or sign in with email</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
  
              {/* Email Input */}
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
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                  placeholder="Username or Email"
                />
              </div>
  
              {/* Password Input */}
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
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm hover:transition-all hover:duration-200 hover:ease-in-out"
                  placeholder="Password"
                />
              </div>
            </div>
  
            {/* Forgot password link */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>
  
            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={loading} // Disable during loading
                className="group relative w-full flex items-center justify-center font-bold py-2 px-4 h-12 border border-transparent text-sm rounded-full text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
            </div>
  
            {/* Sign Up Link */}
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
