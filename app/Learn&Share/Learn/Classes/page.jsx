"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';   
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, arrayUnion } from 'firebase/firestore';
import {firebaseApp} from '../../../../firebaseConfig';
import Link from 'next/link';

const ClassesEntry = () => {
    const router = useRouter();
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);
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
        isPremium: false,
    });
    const [submitted, setSubmitted] = useState(false);
    const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
    const [minRequirement, setMinRequirement] = useState('');
    const [learningPoint, setLearningPoint] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!window.cloudinary) {
            const script = document.createElement("script");
            script.src = "https://upload-widget.cloudinary.com/global/all.js";
            script.async = true;
            script.onload = () => setCloudinaryLoaded(true);
            document.body.appendChild(script);
        } else {
            setCloudinaryLoaded(true);
        }

        onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push('/Login');
            } else {
                setUser(currentUser);
                setFormData(prev => ({ ...prev, procterId: currentUser.uid }));
                
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserType(userDoc.data().type);
                }
            }
        });
    }, [auth, router, db]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };


    const handleImageUpload = () => {
        if (cloudinaryLoaded && window.cloudinary) {
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
                        setFormData((prev) => ({
                            ...prev,
                            imageUrl: result.info.secure_url,
                        }));
                        console.log("Image uploaded:", result.info.secure_url);
                    } else {
                        console.log("Upload error:", error);
                    }
                }
            );
        } else {
            console.log("Cloudinary is not loaded yet.");
        }
    };

    const handleRequirementAdd = () => {
        if (minRequirement) {
            setFormData((prev) => ({
                ...prev,
                minimumRequirements: [...prev.minimumRequirements, minRequirement],
            }));
            setMinRequirement('');
        }
    };

    const handleLearningAdd = () => {
        if (learningPoint) {
            setFormData((prev) => ({
                ...prev,
                whatYouWillLearn: [...prev.whatYouWillLearn, learningPoint],
            }));
            setLearningPoint('');
        }
    };

    const handleRequirementDelete = async (item) => {
        try {
            const updatedRequirements = formData.minimumRequirements.filter((req) => req !== item);
            setFormData((prev) => ({
                ...prev,
                minimumRequirements: updatedRequirements,
            }));
        } catch (error) {
            console.error("Error removing requirement:", error);
            setError("Error removing requirement");
        }
    };

    const handleLearningDelete = async (item) => {
        try {
            const updatedLearning = formData.whatYouWillLearn.filter((learn) => learn !== item);
            setFormData((prev) => ({
                ...prev,
                whatYouWillLearn: updatedLearning,
            }));
        } catch (error) {
            console.error("Error removing learning point:", error);
            setError("Error removing learning point");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const classDoc = await addDoc(collection(db, 'classesCollection'), formData);

            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const currentDate = new Date();
                const dateString = currentDate.toDateString();
                const timestamp = currentDate.toISOString();
                
                const userData = userDocSnap.data();
                let dailyBalance = userData.dailyBalance || 0;
                let balance = userData.balance || 0;
                let numberOfTeaching = userData.numberOfTeaching || 0;
                const lastUpdated = userData.lastUpdated || null;

                if (lastUpdated !== dateString) {
                    dailyBalance = 0;
                }

                let increment = Math.min(50, 250 - dailyBalance);
                if (increment > 0) {
                    dailyBalance += increment;
                    balance += increment;
                }

                const balanceEntry = {
                    date: timestamp,
                    balance: balance,
                    change: increment,
                    type: 'class_creation'
                };

                const teachingEntry = {
                    date: formData.classDate,
                    title: formData.className,
                    classId: classDoc.id
                };

                await updateDoc(userDocRef, {
                    dailyBalance,
                    balance,
                    lastUpdated: dateString,
                    balanceHistory: arrayUnion(balanceEntry),
                    numberOfTeaching: numberOfTeaching + 1,
                    recentTeaching: arrayUnion(teachingEntry)
                });
            }
            setSubmitted(true);
        } catch (error) {
            console.error("Error saving class data:", error);
            setError("Error saving class data");
        } finally {
            setIsLoading(false);
        }
    };

    return !submitted ? (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f6f4] ">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8 mt-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Class Entry</h1>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Class Name:</label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
            </div>

            {(userType === "Teacher" || userType === "Professional") && (
              <div className="flex items-center space-x-3">
                <label className="block text-gray-600 font-medium">Class Type:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Premium Class</span>
                </div>
                {formData.isPremium && (
                  <div className="ml-2 text-sm text-gray-500">
                    (Only available to premium users)
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-gray-600 font-medium mb-1">Age Group:</label>
              <input
                type="text"
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
            </div>
  
            <div>
              <label className="block text-gray-600 font-medium mb-1">Class Type:</label>
              <input
                type="text"
                name="classType"
                value={formData.classType}
                onChange={handleChange}
                placeholder="Enter class type"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
            </div>
  
            <div>
              <label className="block text-gray-600 font-medium mb-1">Class Date:</label>
              <input
                type="date"
                name="classDate"
                value={formData.classDate}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
            </div>
  
            <div>
              <label className="block text-gray-600 font-medium mb-1">Class Time:</label>
              <input
                type="time"
                name="classTime"
                value={formData.classTime}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
            </div>
  
            <div>
              <label className="block text-gray-600 font-medium mb-1">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
            </div>
  
            <div>
              <label className="block text-gray-600 font-medium mb-1">Minimum Requirements:</label>
              <div className="flex flex-col border p-3 rounded-md border-gray-300">
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={minRequirement}
                    onChange={(e) => setMinRequirement(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={handleRequirementAdd}
                    className="ml-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                  >
                    Add
                  </button>
                </div>
                <ul className="list-disc list-inside">
                  {formData.minimumRequirements.map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {item}
                      <button
                        onClick={() => handleRequirementDelete(item)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
  
            <div>
              <label className="block text-gray-600 font-medium mb-1">What You Will Learn:</label>
              <div className="flex flex-col border p-3 rounded-md border-gray-300">
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={learningPoint}
                    onChange={(e) => setLearningPoint(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
                  />
                  <button
                    type="button"
                    onClick={handleLearningAdd}
                    className="ml-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                  >
                    Add
                  </button>
                </div>
                <ul className="list-disc list-inside">
                  {formData.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {item}
                      <button
                        onClick={() => handleLearningDelete(item)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
  
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
              className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    ) : (
      <div className="flex flex-col rounded-lg  items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold pb-8 text-green-600">Class Published Successful</h1>
        <Link href="/Learn&Share/Learn">
        <button className='w-32 bg-green-500 text-white h-12 rounded-lg font-bold'>Go back</button>
        </Link>
      </div>
    );
  };
  
  export default ClassesEntry;