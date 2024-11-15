"use client";
import React, { useState, useEffect } from "react";
import { FaCrown, FaDollarSign, FaEdit } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";

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
  const [activeSection, setActiveSection] = useState(null);

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
  }, []);

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
    <div className="flex justify-center items-center h-screen bg-gray-900 px-4 mt-9">
      <div className="bg-gray-800 p-4 w-full max-w-2xl rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
        {isEditing ? (
          <div className="space-y-4 mb-4 border-2 border-gray-600 p-4 rounded">
            <input
              name="username"
              value={editValues.username}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
              placeholder="Username"
            />
            <input
              name="email"
              value={editValues.email}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
              placeholder="Email"
            />
            <input
              name="phone"
              value={editValues.phone}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
              placeholder="Phone"
            />
            <textarea
              name="bio"
              value={editValues.bio}
              onChange={handleInputChange}
              className="bg-gray-700 text-white w-full rounded p-2"
              placeholder="Bio"
            />
            <button
              onClick={handleSaveChanges}
              className="w-full bg-green-600 text-white rounded p-2 mt-2"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="text-white p-4 border-2 border-gray-600 rounded-lg mb-4">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-white"></div>
              <div className="text-lg flex items-center gap-2 font-semibold">
                {userProfile?.username} <FaCrown className="text-yellow-500" />
              </div>
            </div>
            <div className="pl-4 mt-2 text-sm text-gray-400">{userProfile?.email}</div>
            <div className="pl-4 text-sm text-gray-400">{userProfile?.phone}</div>
            <div className="pl-4 text-sm text-gray-400">{userProfile?.bio}</div>
            <button className="ml-4 mt-4 mr-2  h-9 bg-green-700 text-white rounded-lg w-full sm:w-32">
              List as Teacher
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-4 text-sm sm:text-base">
          <div className="flex items-center text-white">
            <FaDollarSign className="mr-1" />
            <span>{userProfile?.balance}</span>
          </div>
          <button
            onClick={handleEditToggle}
            className="flex items-center text-gray-400 hover:text-gray-200"
          >
            {isEditing ? "Cancel" : "Edit Profile"} <FaEdit className="ml-1" />
          </button>
        </div>

        <div className="flex flex-wrap justify-around bg-gray-700 text-white py-2 rounded-md mb-4">
          {["Foodhub", "Learn&Share", "MarketPlace"].map((section) => (
            <button
              key={section}
              onClick={() => handleSectionClick(section)}
              className={`px-4 py-2 rounded-md font-semibold text-xs sm:text-sm ${
                activeSection === section ? "bg-gray-600" : "bg-gray-800"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="border-2 border-gray-600 rounded-lg p-4 text-base sm:text-lg text-gray-300">
          {activeSection === "Foodhub" && (
            <div className="flex flex-col items-center text-center">
              <div>No. of Foods donated: {userProfile?.totalMealsShared}</div>
              <div>Amount Donated to Cause: Rs.{(userProfile?.totalDonations / 1000).toFixed(1)}K</div>
            </div>
          )}
          {activeSection === "Learn&Share" && (
            <div className="flex flex-col items-center text-center">
              <div>List of All Classes Taken</div>
              <div>User Rating:</div>
            </div>
          )}
          {activeSection === "MarketPlace" && (
            <div className="flex flex-col items-center text-center">
              <div>Number of Products Listed:</div>
              <div>Confirmed Trades:</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
