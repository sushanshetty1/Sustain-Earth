"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment,serverTimestamp } from 'firebase/firestore';
import {firebaseApp} from '../../../firebaseConfig';

const MealEntry = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const [user, setUser] = useState(null);
  const [option, setOption] = useState('restaurant');
  const [formData, setFormData] = useState({
    name: '',
    meals: 1,
    mealType: 'veg',
    imageUrl: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/Login');
      } else {
        setUser(currentUser);
      }
    });

    const script = document.createElement('script');
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [auth, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationAndSubmit = async () => {
    if (!user) return;

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
        };

        await setDoc(doc(db, 'mealsCollection', user.uid), {
            ...formData,
            type: option,
            location: userLocation,
        });

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        let balanceIncrement = formData.meals * 12;
        let newBalance = balanceIncrement;
        let lastUpdated = todayString;

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.lastUpdated === todayString) {
                const remainingBalanceForToday = 250 - (userData.dailyBalance || 0);
                balanceIncrement = Math.min(balanceIncrement, remainingBalanceForToday);
            }

            newBalance = userData.balance + balanceIncrement;

            const balanceHistory = userData.balanceHistory || [];
            const newHistoryEntry = {
                balance: newBalance,
                date: todayString,
            };
            balanceHistory.push(newHistoryEntry);

            await updateDoc(userRef, {
                totalMealsShared: increment(formData.meals),
                dailyBalance: (userData.lastUpdated === todayString)
                    ? increment(balanceIncrement)
                    : balanceIncrement,
                balance: newBalance,
                lastUpdated: todayString,
                balanceHistory,
            });
        } else {
            await setDoc(userRef, {
                totalMealsShared: formData.meals,
                dailyBalance: balanceIncrement,
                balance: newBalance,
                lastUpdated: todayString,
                balanceHistory: [{
                    balance: newBalance,
                    date: todayString,
                }],
            });
        }

        setSubmitted(true);
    } catch (error) {
        if (error.code === 'PERMISSION_DENIED') {
            alert("Location access must be given");
        } else {
            alert("Error obtaining location or saving data. Please try again.");
            console.error("Location or Firestore error:", error);
        }
    }
};

  
    

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLocationAndSubmit();
  };

  const handleImageUpload = () => {
    if (window.cloudinary) {
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
          }
        }
      );
    }
  };

  return !submitted ? (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#f9f6f4' }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Meal Entry</h1>

        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Select Type:</label>
          <select
            onChange={(e) => setOption(e.target.value)}
            value={option}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
          >
            <option value="restaurant">Restaurant</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              {option === 'restaurant' ? 'Restaurant Name' : 'Your Name'}:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Number of Meals:</label>
            <input
              type="number"
              name="meals"
              min="1"
              value={formData.meals}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Meal Type:</label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={handleImageUpload}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Upload Image
            </button>
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Uploaded" className="mt-4 w-full rounded-md" />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#f9f6f4' }}>
      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">Thank you for your donation ❤️</h1>
      <button
        onClick={() => router.push('/FoodHub')}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
      >
        Exit
      </button>
    </div>
  );
};

export default MealEntry;
