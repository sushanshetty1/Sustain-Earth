"use client";
import React, { useState, useEffect } from "react";
import { FaCrown } from "react-icons/fa";
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import Loader from "./loader";
import Image from "next/image";
import { toast } from "react-hot-toast";
import ProgressDashboard from './levelup';
import Button from "./Button";
import coinIcon from "./coinSVG.svg";

const CoinIcon = () => (
  <Image 
    src={coinIcon}
    alt="Coin"
    width={16}
    height={16}
    className="inline-block"
  />
);

const PremiumModal = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
      <h2 className="text-3xl font-bold mb-4 text-center text-white">Upgrade to Premium</h2>
      <div className="mb-4">
        <p className="text-gray-300 text-center">
          Get exclusive features and be a part of our mission to grow!
        </p>
      </div>
      <div className="mb-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-white">Premium Plan</h3>
          <p className="text-gray-400">Monthly Subscription: ₹59</p>
          <ul className="list-disc list-inside text-sm text-gray-300 mt-2">
            <li>Boost your Daily Coin Limit by +100</li>
            <li>Challenge as many friends as you like</li>
            <li>Gain VIP Access to Expert-Led Premium Classes</li>
          </ul>
        </div>
      </div>
      <div className="flex justify-between">
        <button 
          onClick={onClose} 
          className="w-full mr-2 bg-gray-600 text-white rounded p-2 hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onUpgrade} 
          className="w-full bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    </div>
    </div>
  );
};

const Info = ({ isOpen, onClose, title, description, details, primaryButtonText, primaryButtonAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4 text-center text-white">{title}</h2>
        <div className="mb-4">
          <p className="text-gray-300 text-center">
            {description}
          </p>
        </div>
        {details && (
          <div className="mb-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <ul className="list-disc list-inside text-sm text-gray-300 mt-2">
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="flex justify-between">
          <button 
            onClick={onClose} 
            className="w-full mr-2 bg-red-600 text-white rounded p-2 hover:bg-red-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const PremiumDeadline = ({ premiumEndDate }) => {
  if (!premiumEndDate) return null;

  const endDate = new Date(premiumEndDate);
  const today = new Date();
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white sm:px-4 px-1 py-2 rounded-lg shadow-md">
      <FaCrown className="text-white h-[18.9px] w-[18.9px] sm:text-lg text-md" />
      <div className="flex flex-col">
        <span className="font-semibold">Premium Active</span>
        <span className="md:block hidden text-sm">
          {daysLeft > 0 
            ? `${daysLeft} days remaining`
            : "Expires today"
          }
        </span>
      </div>
    </div>
  );
};

const ProfileSection = ({ userProfile, onImageUpload, onPremiumUpgrade }) => (
  <div className="flex gap-4 items-center justify-between">
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
        {userProfile?.username}
      </div>
    </div>
    {userProfile?.premium ? (
      <PremiumDeadline premiumEndDate={userProfile.premiumEndDate} />
    ) : (
      <div onClick={onPremiumUpgrade}>
        <Button />
      </div>
    )}
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

const StatsSection = ({ section, userProfile }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return dateString;
    } catch (error) {
      console.error("Date parsing error:", error);
      return dateString;
    }
  };

  const isDatePassed = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date < new Date();
      }
      return false;
    } catch (error) {
      console.error("Date comparison error:", error);
      return false;
    }
  };

  const handleCertificateClick = async (teaching) => {
    try {
      const { handleCertificateGeneration } = await import('./certificateGenerator');
      const success = await handleCertificateGeneration(teaching, userProfile.firstName);
      
      if (success) {
        toast.success('Certificate generated successfully!');
      } else {
        toast.error('Failed to generate certificate');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error('Failed to generate certificate');
    }
  };

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
        value: userProfile?.numberOfTeaching || 0
      },
      {
        label: "Recent Knowledge Share",
        CustomComponent: () => {
          const recentTeaching = userProfile?.recentTeaching || [];
          
          if (!recentTeaching.length) {
            return <span className="text-gray-500">No Recent Data</span>;
          }

          return (
            <div className="space-y-2">
              {recentTeaching.map((teaching, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex flex-col">
                    <span className="font-medium">{teaching.title || teaching[1] || "Untitled"}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(teaching.date || teaching[0])}
                    </span>
                  </div>
                  {isDatePassed(teaching.date || teaching[0]) && (
                    <button 
                      onClick={() => handleCertificateClick(teaching)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm transition-colors"
                    >
                      Get Certificate
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        }
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
    <div className="space-y-4">
      {stats.map(({ label, value, prefix = "", className = "", CustomComponent }, index) => (
        <div key={index} className="flex flex-col">
          <span className="text-gray-600">{label}:</span>
          <div className="mt-1">
            {CustomComponent ? (
              <CustomComponent />
            ) : (
              <span className={`font-semibold ${className}`}>
                {prefix}{value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


const DashBoard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [showProgress, setShowProgress] = useState(false);

  const router = useRouter();

  const handleConfirm = () => {
    console.log("Confirmed!");
    setIsModalOpen(false);
  };  

  const handlePremiumUpgrade = async () => {
    try {
      if (!auth.currentUser) {
        toast.error("You must be logged in");
        return;
      }

      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        premium: true,
        premiumEndDate: endDate.toISOString()
      });

      const revenueCollectionRef = collection(db, "revenueCollections");
      await addDoc(revenueCollectionRef, {
        userId: auth.currentUser.uid,
        username: userProfile?.username,
        date: new Date(),
        amount: 59,
        type: 'premium_subscription',
        paymentStatus: "completed"
      });
      
      setUserProfile(prev => ({
        ...prev,
        premium: true,
        premiumEndDate: endDate.toISOString()
      }));
      
      setIsPremiumModalOpen(false);
      toast.success("Successfully upgraded to Premium!");
      
      window.location.reload();
    } catch (error) {
      toast.error("Failed to upgrade to Premium");
      console.error("Premium upgrade error:", error);
    }
  };
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (userProfile?.premium && userProfile?.premiumEndDate) {
        const endDate = new Date(userProfile.premiumEndDate);
        const now = new Date();
        
        if (endDate < now) {
          try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
              premium: false,
              premiumEndDate: null
            });
            
            setUserProfile(prev => ({
              ...prev,
              premium: false,
              premiumEndDate: null
            }));
          } catch (error) {
            console.error("Error updating expired premium status:", error);
          }
        }
      }
    };

    checkPremiumStatus();
  }, [userProfile]);

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
          router.push('/Login');
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
      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={handlePremiumUpgrade}
      />
      <div className="p-4">
        {/* Original Profile Section */}
        <div className="bg-white p-3 sm:p-6 w-full max-w-2xl mx-auto rounded-lg shadow-lg transform transition duration-300 hover:scale-105 mb-8">
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
                onPremiumUpgrade={() => setIsPremiumModalOpen(true)}
              />
              
              <div className="space-y-1 pl-4 text-sm text-gray-600">
                <div>{userProfile?.email}</div>
                <div>{userProfile?.phone}</div>
                <div>{userProfile?.bio}</div>
                <div className="flex items-center">
                  <CoinIcon />
                  <span className="mr-1">{userProfile?.balance}</span>
                  <Info 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    title="Get More Coins"
                    description="Here's what you need to do"
                    details={[
                      "₹250 donated = 25 coins",
                      "Each meal donated = 12 coins",
                      "Forum Posts = 25 coins",
                      "100 views = 5 coins",
                      "25 likes = 5 coins",
                      "Class Upload = 50 coins"
                    ]}
                  />
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="flex items-center justify-center"
                  >
                    <svg 
                      className="w-4 h-4 text-gray-600 cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg" 
                      height="18px" 
                      viewBox="0 -960 960 960" 
                      width="18px" 
                      fill="#000000"
                    >
                      <path d="M480-240q20 0 34-14t14-34q0-20-14-34t-34-14q-20 0-34 14t-14 34q0 20 14 34t34 14Zm-36-153h73q0-37 6.5-52.5T555-485q35-34 48.5-58t13.5-53q0-55-37.5-89.5T484-720q-51 0-88.5 27T343-620l65 27q9-28 28.5-43.5T482-652q28 0 46 16t18 42q0 23-15.5 41T496-518q-35 32-43.5 52.5T444-393Zm36 297q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z" />
                    </svg>
                  </button>
                </div>
              </div>


              <div className="flex items-center justify-between  mr-1">
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