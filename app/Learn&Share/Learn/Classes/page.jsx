"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc
} from 'firebase/firestore';
import { firebaseApp } from '../../../../firebaseConfig';
import Link from 'next/link';

const ClassesEntry = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const [minRequirement, setMinRequirement] = useState('');
  const [learningPoint, setLearningPoint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    className: '',
    standard: '',
    classType: '',
    classDate: '',
    classTime: '',
    imageUrl: '',
    description: '',
    minimumRequirements: [],
    whatYouWillLearn: [],
    classLink: '',
    isPremium: false,
    procterId: '',
    createdAt: new Date().toISOString(),
    status: 'upcoming' // can be 'upcoming', 'ongoing', or 'completed'
  });

  useEffect(() => {
    // Load Cloudinary widget
    if (!window.cloudinary) {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = () => setCloudinaryLoaded(true);
      document.body.appendChild(script);
    } else {
      setCloudinaryLoaded(true);
    }

    // Check authentication and fetch user type
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/Login');
      } else {
        setUser(currentUser);
        setFormData(prev => ({ ...prev, procterId: currentUser.uid }));
        
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserType(userData.type);
          }
        } catch (error) {
          console.error("Error fetching user type:", error);
          setError("Error fetching user data");
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth, router, db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Special handling for isPremium field
    if (name === 'isPremium') {
      processedValue = value === 'true';
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleImageUpload = () => {
    if (!cloudinaryLoaded || !window.cloudinary) {
      setError("Image upload is not ready yet. Please try again in a moment.");
      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: "dwkxh75ux",
        uploadPreset: "sharepics",
        sources: ["local", "url", "camera"],
        cropping: true,
        multiple: false,
        resourceType: "image",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setFormData(prev => ({
            ...prev,
            imageUrl: result.info.secure_url,
          }));
          console.log("Image uploaded:", result.info.secure_url);
        } else if (error) {
          console.error("Upload error:", error);
          setError("Failed to upload image. Please try again.");
        }
      }
    );
  };

  const handleRequirementAdd = () => {
    if (minRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        minimumRequirements: [...prev.minimumRequirements, minRequirement.trim()],
      }));
      setMinRequirement('');
    }
  };

  const handleLearningAdd = () => {
    if (learningPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, learningPoint.trim()],
      }));
      setLearningPoint('');
    }
  };

  const handleRequirementDelete = (item) => {
    try {
      const updatedRequirements = formData.minimumRequirements.filter(
        req => req !== item
      );
      setFormData(prev => ({
        ...prev,
        minimumRequirements: updatedRequirements,
      }));
    } catch (error) {
      console.error("Error removing requirement:", error);
      setError("Error removing requirement");
    }
  };

  const handleLearningDelete = (item) => {
    try {
      const updatedLearning = formData.whatYouWillLearn.filter(
        learn => learn !== item
      );
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: updatedLearning,
      }));
    } catch (error) {
      console.error("Error removing learning point:", error);
      setError("Error removing learning point");
    }
  };

  const validateFormData = () => {
    if (!formData.className.trim()) return "Class name is required";
    if (!formData.standard.trim()) return "Standard is required";
    if (!formData.classDate.trim()) return "Class date is required";
    if (!formData.classTime.trim()) return "Class time is required";
    if (!formData.classLink.trim()) return "Class link is required";
    if (!formData.description.trim()) return "Description is required";
    if (formData.minimumRequirements.length === 0) return "At least one minimum requirement is required";
    if (formData.whatYouWillLearn.length === 0) return "At least one learning point is required";
    if (!formData.imageUrl) return "Class image is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const validationError = validateFormData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add the class data to Firestore
      const classRef = await addDoc(collection(db, 'classesCollection'), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update user's balance and history
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const currentDate = new Date().toDateString();
        const userData = userDocSnap.data();
        let dailyBalance = userData.dailyBalance || 0;
        let balance = userData.balance || 0;
        const lastUpdated = userData.lastUpdated || null;
        const balanceHistory = userData.balanceHistory || [];

        // Reset daily balance if it's a new day
        if (lastUpdated !== currentDate) {
          dailyBalance = 0;
        }

        // Calculate balance increment (max 50 points per class, up to 250 daily)
        let increment = Math.min(50, 250 - dailyBalance);
        if (increment > 0) {
          dailyBalance += increment;
          balance += increment;

          const newHistoryEntry = {
            balance,
            date: currentDate,
            type: 'class_creation',
            classId: classRef.id,
            points: increment
          };
          balanceHistory.push(newHistoryEntry);

          await updateDoc(userDocRef, {
            dailyBalance,
            balance,
            lastUpdated: currentDate,
            balanceHistory,
          });
        }
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error saving class data:", error);
      setError("Failed to save class data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const FormInput = ({ label, type, name, value, onChange, required = false, placeholder = '' }) => (
    <div>
      <label className="block text-gray-600 font-medium mb-1">{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
      />
    </div>
  );

  const ListSection = ({ title, items, inputValue, setInputValue, onAdd, onDelete }) => (
    <div>
      <label className="block text-gray-600 font-medium mb-1">{title}:</label>
      <div className="flex flex-col border p-3 rounded-md border-gray-300">
        <div className="flex mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
          />
          <button
            type="button"
            onClick={onAdd}
            className="ml-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Add
          </button>
        </div>
        <ul className="list-disc list-inside">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              {item}
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="flex flex-col rounded-lg items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold pb-8 text-green-600">
          Class Published Successfully
        </h1>
        <Link href="/Learn&Share/Learn">
          <button className="w-32 bg-green-500 text-white h-12 rounded-lg font-bold">
            Go back
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f6f4]">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8 mt-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Class Entry</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Class Name"
            type="text"
            name="className"
            value={formData.className}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Which Standard"
            type="text"
            name="standard"
            value={formData.standard}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Class Type"
            type="text"
            name="classType"
            value={formData.classType}
            onChange={handleChange}
            placeholder="Enter class type"
          />

          <FormInput
            label="Class Date"
            type="date"
            name="classDate"
            value={formData.classDate}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Class Time"
            type="time"
            name="classTime"
            value={formData.classTime}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Class Link"
            type="url"
            name="classLink"
            value={formData.classLink}
            onChange={handleChange}
            placeholder="Enter Google Meet link"
            required
          />

          <div>
            <label className="block text-gray-600 font-medium mb-1">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 min-h-[100px]"
            />
          </div>

          {(userType === "Teacher" || userType === "Professional") && (
            <div>
              <label className="block text-gray-600 font-medium mb-1">Class Access:</label>
              <select
                name="isPremium"
                value={formData.isPremium}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
                required
              >
                <option value={false}>Free</option>
                <option value={true}>Premium Only</option>
              </select>
            </div>
          )}

          <ListSection
            title="Minimum Requirements"
            items={formData.minimumRequirements}
            inputValue={minRequirement}
            setInputValue={setMinRequirement}
            onAdd={handleRequirementAdd}
            onDelete={handleRequirementDelete}
          />

          <ListSection
            title="What You Will Learn"
            items={formData.whatYouWillLearn}
            inputValue={learningPoint}
            setInputValue={setLearningPoint}
            onAdd={handleLearningAdd}
            onDelete={handleLearningDelete}
          />

          <div>
            <button
              type="button"
              onClick={handleImageUpload}
              className="w-full p-3 mb-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Upload Image
            </button>
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Class Image"
                className="w-full h-48 object-cover rounded-md"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>

          {error && (
            <div className="text-red-600 text-center mt-2 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </form>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-800">Saving class data...</p>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default ClassesEntry;