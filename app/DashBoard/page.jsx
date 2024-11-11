"use client";
import React, { useState, useEffect } from "react";
import { FaCrown, FaDollarSign, FaEdit } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import Header from "@/components/Header";

const DashBoard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    balance: 0,
  });
  const [activeSection, setActiveSection] = useState(null); // Track which section is active

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile(data);
          setEditValues({
            username: data.username || "username",
            email: data.email || "email@example.com",
            phone: data.phone || "123-456-7890",
            bio: data.bio || "A short bio",
            balance: data.balance || 0,
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        ...editValues,
      });
      setUserProfile(editValues);
      setIsEditing(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const handleSectionClick = (section) => {
    setActiveSection((prevSection) => (prevSection === section ? null : section));
  };

  return (
    <div className="flex justify-center flex-row items-center h-screen">
      <div className="bg-gray-800 p-4 h-fit w-[90%] rounded-lg flex justify-between flex-col shadow-lg   transform transition duration-300 hover:scale-105">
        {isEditing ? (
          <div className="space-y-2 border-white border-2 mb-4">
            <input
              name="username"
              value={editValues.username}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
            />
            <input
              name="email"
              value={editValues.email}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
            />
            <input
              name="phone"
              value={editValues.phone}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
            />
            <textarea
              name="bio"
              value={editValues.bio}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
            />
            <button
              onClick={handleSaveChanges}
              className="w-full bg-green-600 text-white rounded p-2 mt-2"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="text-white p-8 border-white border-2 rounded-lg space-y-2 mb-4">
            <div className="pl-5 pt-5 flex flex-row gap-4">
            <div className="w-20 h-20 rounded-full bg-white"></div>
            <div className="text-lg flex w-fit flex-row justify-center items-center gap-5 font-semibold">
              {userProfile?.username}
              <FaCrown className="text-yellow-500" />
            </div>
            
      
            </div>
            <div className="pl-5 text-sm text-gray-400">{userProfile?.email}</div>
            <div className="pl-5 text-sm text-gray-400">{userProfile?.phone}</div>
            <div className="pl-5 text-sm text-gray-400">{userProfile?.bio}</div>
            <button className="ml-5 mb-5 pb-5 h-9 text-md bg-green-700 rounded-lg w-28">
              List as teacher
            </button>
          </div>
        )}
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center text-white text-sm">
            <FaDollarSign className="mr-1" />
            <span>{userProfile?.balance}</span>
          </div>
          <button
            onClick={handleEditToggle}
            className="flex items-center text-gray-400 hover:text-gray-200 text-sm"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
            <FaEdit className="ml-1" />
          </button>
        </div>

        {/* Bottom navigation buttons */}
        <div className="w-full justify-evenly bg-gray-800 flex text-white items-center h-20">
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleSectionClick("foodhub")}
              className="h-12 w-28 text-sm border-black rounded-md font-bold border-2"
            >
              Foodhub
            </button>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleSectionClick("Learn&Share")}
              className="h-12 w-28 text-sm border-black rounded-md font-bold border-2"
            >
              Learn&Share
            </button>
          </div>
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleSectionClick("marketPlace")}
              className="h-12 w-28 text-sm border-black rounded-md font-bold border-2"
            >
              MarketPlace
            </button>
          </div>
        </div>

        {/* Content below the buttons */}
        <div className="mt-4 border-white border-2 rounded-lg h-16 text-lg flex justify-center items-center">
  {activeSection === "foodhub" && (
    <div className="text-sm flex flex-col items-center text-center text-gray-300">
      <div className="w-full">No. of Foods donated:</div>
      <div className="w-full">Amount Donated to Cause:</div>
    </div>
  )}
  {activeSection === "Learn&Share" && (
    <div className="text-sm text-gray-300 gap-2 flex flex-col items-center text-center">
      <div className="flex gap-8 flex-row w-full"><div>List of All classes taken</div><div>user rating</div></div>
      <div className="w-full">List of All classes taken</div>
      <div></div>
    </div>
  )}
  {activeSection === "marketPlace" && (
    <div className="text-sm text-gray-300 flex flex-col items-center text-center">
      <div className="w-full">Number of products listed:</div>
      <div className="w-full">Confirmed trades:</div>
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default DashBoard;
