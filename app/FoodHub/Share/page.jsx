"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../../../firebaseConfig';

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

      // Save meal information directly under the user's UID in the 'mealsCollection'
      await setDoc(doc(db, 'mealsCollection', user.uid), {
        ...formData,  // includes meal data like name, meals, mealType
        type: option,
        location: userLocation,
      });

      setSubmitted(true);
    } catch (error) {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Location access must be given");
      } else {
        console.error("Error obtaining location or saving data:", error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLocationAndSubmit();
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
