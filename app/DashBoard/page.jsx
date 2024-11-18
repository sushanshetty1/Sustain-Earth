"use client";
import React, { useState, useEffect } from "react";
import { FaCrown } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import Loader from "./loader";
import styled from "styled-components";
import prof from "../../public/images/prof.png"

const DashBoard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    balance: 0,
  });
  const [activeSection, setActiveSection] = useState(null);
  const [uploading, setUploading] = useState({ profilePic: false });

  const router = useRouter();

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
    setEditValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, editValues);
      setUserProfile(editValues);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleImageUpload = async (imageType) => {
    if (!window.cloudinary) {
      alert("Cloudinary widget is not loaded yet.");
      return;
    }

    setUploading((prev) => ({ ...prev, [imageType]: true }));

    window.cloudinary.openUploadWidget(
      {
        cloudName: "dwkxh75ux",
        uploadPreset: "itemspic",
        sources: ["local", "url", "camera"],
        cropping: true,
        multiple: false,
        resourceType: "image",
      },
      async (error, result) => {
        setUploading((prev) => ({ ...prev, [imageType]: false }));
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          alert("Error uploading image.");
          return;
        }
        if (result.event === "success") {
          const imageUrl = result.info.secure_url;

          if (auth.currentUser) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { [imageType]: imageUrl });
            setUserProfile((prev) => ({ ...prev, [imageType]: imageUrl }));
            alert("Profile picture updated!");
          }
        }
      }
    );
  };

  const handleSectionClick = (section) => {
    setActiveSection((prevSection) => (prevSection === section ? null : section));
  };

  const handleTeacher = () => router.push(`/DashBoard/Teacher`);
  const handleProfessional = () => router.push(`/DashBoard/Professional`);

  const isChangeButtonHidden = ["Admin", "Teacher", "Professional"].includes(
    userProfile?.type
  );

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

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
            <div
              onClick={() => handleImageUpload("profilePic")}
              className="userProfile w-16 h-16 rounded-full bg-gray-200 bg-cover bg-center"
              style={{
                backgroundImage: `url(${userProfile?.profilePic || {prof}})`,
              }}
            ></div>
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
                <span className="font-bold mb-5">
                  User Type: {userProfile?.type}
                </span>
                {!isChangeButtonHidden && (
                  <button
                    onClick={() => setShowButtons(!showButtons)}
                    className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded text-black ml-2"
                  >
                    {showButtons ? "Cancel" : "Change"}
                  </button>
                )}
              </div>
              {showButtons && (
                <StyledWrapper>
                  <button onClick={handleTeacher} className="btn-31">
                    Teacher
                  </button>
                  <button onClick={handleProfessional} className="btn-31">
                    Professional
                  </button>
                </StyledWrapper>
              )}
            </div>
            <div className="flex flex-wrap justify-around bg-gray-200 text-black py-2 rounded-md mt-9 mb-4">
              {["Foodhub", "Learn&Share", "MarketPlace"].map((section) => (
                <button
                  key={section}
                  onClick={() => handleSectionClick(section)}
                  className={`px-4 py-2 rounded-md font-semibold ${
                    activeSection === section
                      ? "bg-gray-300"
                      : "bg-gray-200"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-4">
              {activeSection === "Foodhub" && (
                <div>
                  <div>
                    No. of Foods donated: {userProfile?.totalMealsShared || 0}
                  </div>
                  <div>
                    Recent Food Donation:{" "}
                    {userProfile?.recentMealShared || "No Recent Data"}
                  </div>
                </div>
              )}
              {activeSection === "Learn&Share" && (
                <div>
                  <div>
                    No. of Teachings: {userProfile?.totalTeachingShared || 0}
                  </div>
                  <div>
                    Recent Knowledge Share:{" "}
                    {userProfile?.recentTeachingShared || "No Recent Data"}
                  </div>
                </div>
              )}
              {activeSection === "MarketPlace" && (
                <div>
                  <div>
                    No. of Products sold: {userProfile?.totalMarketSold || 0}
                  </div>
                  <div>
                    Recent Sale:{" "}
                    {userProfile?.recentMarketSold || "No Recent Data"}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleEditToggle}
              className="w-full bg-blue-500 text-white rounded p-2 mt-4 hover:bg-blue-600"
            >
              Edit
            </button>
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
