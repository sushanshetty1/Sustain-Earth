"use client"
import React, { useState, useEffect } from "react";
import { FaCrown, FaDollarSign, FaEdit } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-gray-800 p-6 h-96 rounded-lg shadow-lg max-w-sm w-full transform transition duration-300 hover:scale-105">
        {isEditing ? (
          <div className="space-y-2 mb-4">
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
          <div className="text-white space-y-2 mb-4">
            <div className="text-lg font-semibold">{userProfile?.username}</div>
            <div className="text-sm text-gray-400">{userProfile?.email}</div>
            <div className="text-sm text-gray-400">{userProfile?.phone}</div>
            <div className="text-sm text-gray-400">{userProfile?.bio}</div>
          </div>
        )}
        <div className="flex justify-between items-center">
          <FaCrown className="text-yellow-500" />
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
      </div>
    </div>
  );
};

export default DashBoard;
