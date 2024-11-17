"use client";
import React, { useState, useEffect } from "react";
import { FaCrown, FaDollarSign, FaEdit } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import Loader from "./loader";
import styled from "styled-components";

const DashBoard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const router = useRouter();
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

  const handleToggleChange = () => {
    setShowButtons((prev) => !prev);
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
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const handleSectionClick = (section) => {
    setActiveSection((prevSection) =>
      prevSection === section ? null : section
    );
  };

  const handleTeacher = () => (
    router.push(`/DashBoard/Teacher`)
  );

  const handleProfessional = () => (
    router.push(`/DashBoard/Proffesional`)
  );

  return (
    <div className="flex justify-center items-center h-screen bg-[#f9f6f4] px-4 mt-9">
      <div className="bg-white p-4 w-full text-black max-w-2xl rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
        {isEditing ? (
          <div className="space-y-4 mb-4 border-2 border-gray-300 p-4 rounded">
            <input
              name="username"
              value={editValues.username}
              onChange={handleInputChange}
              className="bg-gray-100 text-black w-full rounded p-2 border border-gray-300"
              placeholder="Username"
            />
            <input
              name="email"
              value={editValues.email}
              onChange={handleInputChange}
              disabled
              className="bg-gray-100 text-black w-full rounded p-2 border border-gray-300"
              placeholder="Email"
            />
            <input
              name="phone"
              value={editValues.phone}
              onChange={handleInputChange}
              className="bg-gray-100 text-black w-full rounded p-2 border border-gray-300"
              placeholder="Phone"
            />
            <textarea
              name="bio"
              value={editValues.bio}
              onChange={handleInputChange}
              className="bg-gray-100 text-black w-full rounded p-2 border border-gray-300"
              placeholder="Bio"
            />
            <button
              onClick={handleSaveChanges}
              className="w-full bg-blue-500 text-white rounded p-2 mt-2 hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="text-black p-4 border-2 border-gray-300 rounded-lg mb-4">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200"></div>
              <div className="text-lg flex items-center gap-2 font-semibold">
                {userProfile?.username} <FaCrown className="text-yellow-500" />
              </div>
            </div>
            <div className="pl-4 mt-2 text-sm text-gray-600">
              {userProfile?.email}
            </div>
            <div className="pl-4 text-sm text-gray-600">
              {userProfile?.phone}
            </div>
            <div className="pl-4 text-sm text-gray-600">{userProfile?.bio}</div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                <span className="font-bold">
                  User Type: {userProfile?.type}
                </span>
                <button
                  onClick={handleToggleChange}
                  className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded text-black ml-2"
                >
                  {showButtons ? "Cancel" : "Change"}
                </button>
              </div>
              {showButtons && (
                <StyledWrapper>
                  <button onClick={handleTeacher} className="btn-31">Teacher</button>
                  <button onClick={handleProfessional} className="btn-31">Professional</button>
                </StyledWrapper>
              )}
            </div>
            {!isEditing && (
              <div className="flex justify-end">
          <button
            onClick={handleEditToggle}
            className="w-fit bg-transparent text-blue-500 rounded p-2 mt-2  flex items-center justify-center gap-2"
          >
            <FaEdit className="text-xl" /> Edit Profile
          </button>
          </div>
        )}

            <div className="flex flex-wrap justify-around bg-gray-200 text-black py-2 rounded-md mb-4">
              {["Foodhub", "Learn&Share", "MarketPlace"].map((section) => (
                <button
                  key={section}
                  onClick={() => handleSectionClick(section)}
                  className={`px-4 py-2 rounded-md font-semibold ${activeSection === section ? "bg-gray-300" : "bg-gray-200"}`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              {activeSection === "Foodhub" && (
                <div>
                  <div>No. of Foods donated: {userProfile?.totalMealsShared}</div>
                  <div>Amount Donated to Cause: Rs. {(userProfile?.totalDonations / 1000).toFixed(1)}K</div>
                </div>
              )}
              {activeSection === "Learn&Share" && (
                <div>
                  <div>List of All Classes Taken</div>
                  <div>User Rating:</div>
                </div>
              )}
              {activeSection === "MarketPlace" && (
                <div>
                  <div>Number of Products Listed:</div>
                  <div>Confirmed Trades:</div>
                </div>
              )}
            </div>
          </div>
        )}
       
      </div>
    </div>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  gap: 10px;

  .btn-31 {
    background-color: #000;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover {
      background-color: #444;
    }
  }
`;

export default DashBoard;
