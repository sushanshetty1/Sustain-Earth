"use client";
import React, { useState, useEffect } from "react";
import { FaCrown } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import Loader from "./loader";
import Image from "next/image";
import { toast } from "react-hot-toast";
import ProgressDashboard from './levelup';

const ProfileSection = ({ userProfile, onImageUpload }) => (
  <div className="flex gap-4 items-center">
    <div
      onClick={() => onImageUpload("profilePic")}
      className="relative w-16 h-16 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      <Image
        src={userProfile?.profilePic || "/images/prof.png"}
        alt="Profile"
        fill
        className="object-cover"
      />
    </div>
    <div className="text-lg flex items-center gap-2 font-semibold">
      {userProfile?.username} <FaCrown className="text-yellow-500" />
    </div>
  </div>
);

const EditForm = ({ editValues, onInputChange, onSave }) => (
  <div className="space-y-4 mb-4 border-2 border-gray-300 p-4 rounded">
    <input
      name="username"
      value={editValues.username}
      onChange={onInputChange}
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
      onChange={onInputChange}
      className="bg-gray-100 text-black w-full rounded p-2 border border-gray-300"
      placeholder="Phone"
    />
    <textarea
      name="bio"
      value={editValues.bio}
      onChange={onInputChange}
      className="bg-gray-100 text-black w-full rounded p-2 border border-gray-300"
      placeholder="Bio"
      rows={4}
    />
    <button
      onClick={onSave}
      className="w-full bg-blue-500 text-white rounded p-2 mt-2 hover:bg-blue-600 transition-colors"
    >
      Save Changes
    </button>
  </div>
);

// Stats Section Component
const StatsSection = ({ section, userProfile }) => {
  const statsConfig = {
    Foodhub: [
      {
        label: "No. of Foods donated",
        value: userProfile?.totalMealsShared || 0,
        prefix: "",
        className: "text-[#28a745]"
      },
      {
        label: "Cumulative Donations",
        value: userProfile?.totalDonations || "0",
        prefix: "₹",
        className: "text-[#28a745]"
      }
    ],
    "Learn&Share": [
      {
        label: "No. of Teachings",
        value: userProfile?.totalTeachingShared || 0
      },
      {
        label: "Recent Knowledge Share",
        value: userProfile?.recentTeachingShared || "No Recent Data"
      }
    ],
    MarketPlace: [
      {
        label: "No. of Products sold",
        value: userProfile?.totalMarketSold || 0
      },
      {
        label: "Recent Sale",
        value: userProfile?.recentMarketSold || "No Recent Data"
      }
    ]
  };

  const stats = statsConfig[section];
  if (!stats) return null;

  return (
    <div className="space-y-2">
      {stats.map(({ label, value, prefix = "", className = "" }, index) => (
        <div key={index}>
          {label}:{" "}
          <span className={`font-semibold ml-3 ${className}`}>
            {prefix}{value}
          </span>
        </div>
      ))}
    </div>
  );
};

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
  const [showProgress, setShowProgress] = useState(false); // New state for progress section

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
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
        } else {
          router.push('/login');
        }
      } catch (error) {
        toast.error("Error loading profile");
        console.error("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

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
      toast.error("Upload widget not loaded yet");
      return;
    }

    setUploading((prev) => ({ ...prev, [imageType]: true }));

    const uploadWidget = window.cloudinary.createUploadWidget(
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
          toast.error("Error uploading image");
          console.error("Upload error:", error);
          return;
        }
        
        if (result.event === "success") {
          try {
            const imageUrl = result.info.secure_url;
            if (auth.currentUser) {
              const userRef = doc(db, "users", auth.currentUser.uid);
              await updateDoc(userRef, { [imageType]: imageUrl });
              setUserProfile((prev) => ({ ...prev, [imageType]: imageUrl }));
              toast.success("Profile picture updated!");
            }
          } catch (error) {
            toast.error("Failed to update profile picture");
            console.error("Update error:", error);
          }
        }
      }
    );

    uploadWidget.open();
  };

  const handleSaveChanges = async () => {
    try {
      if (!auth.currentUser) {
        toast.error("You must be logged in");
        return;
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, editValues);
      setUserProfile((prev) => ({ ...prev, ...editValues }));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Save error:", error);
    }
  };

  const handleTypeChange = async (newType) => {
    try {
      router.push(`/DashBoard/${newType}`);
    } catch (error) {
      toast.error(`Failed to change to ${newType}`);
      console.error("Navigation error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const isChangeButtonHidden = ["Admin", "Teacher", "Professional"].includes(
    userProfile?.type
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f6f4]">
      <div className="p-4">
        {/* Original Profile Section */}
        <div className="bg-white p-6 w-full max-w-2xl mx-auto rounded-lg shadow-lg transform transition duration-300 hover:scale-105 mb-8">
          {isEditing ? (
            <EditForm
              editValues={editValues}
              onInputChange={(e) => setEditValues(prev => ({
                ...prev,
                [e.target.name]: e.target.value
              }))}
              onSave={handleSaveChanges}
            />
          ) : (
            <div className="text-black p-4 border-2 border-gray-300 rounded-lg space-y-4">
              <ProfileSection
                userProfile={userProfile}
                onImageUpload={handleImageUpload}
              />
              
              <div className="space-y-1 pl-4 text-sm text-gray-600">
                <div>{userProfile?.email}</div>
                <div>{userProfile?.phone}</div>
                <div>{userProfile?.bio}</div>
                <div>Balance : {userProfile?.balance}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-bold">
                    User Type: {userProfile?.type}
                  </span>
                  {!isChangeButtonHidden && (
                    <button
                      onClick={() => setShowButtons(!showButtons)}
                      className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded text-black ml-2 transition-colors"
                    >
                      {showButtons ? "Cancel" : "Change"}
                    </button>
                  )}
                </div>
                {showButtons && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTypeChange("Teacher")}
                      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                      Teacher
                    </button>
                    <button
                      onClick={() => handleTypeChange("Professional")}
                      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                      Professional
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-around bg-gray-200 text-black py-2 rounded-md">
                {["Foodhub", "Learn&Share", "MarketPlace", "Progress"].map((section) => (
                  <button
                    key={section}
                    onClick={() => {
                      if (section === "Progress") {
                        setShowProgress(true);
                        setActiveSection(null);
                      } else {
                        setShowProgress(false);
                        setActiveSection(prev => prev === section ? null : section);
                      }
                    }}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      (section === "Progress" ? showProgress : activeSection === section)
                        ? "bg-gray-300"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>

              {activeSection && (
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <StatsSection section={activeSection} userProfile={userProfile} />
                </div>
              )}

              {!showProgress && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Dashboard Section */}
        {showProgress && (
          <div className="w-full max-w-4xl mx-auto">
            <ProgressDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;