"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../../../../firebaseConfig';

const ClassesEntry = () => {
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    standard: '',
    classType: '',
    classDate: '',
    classTime: '',
    imageUrl: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await setDoc(doc(db, 'classesCollection', user.uid), formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving class data:", error);
    }
  };

  return !submitted ? (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#f9f6f4' }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Class Entry</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Class Name:</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Which Standard:</label>
            <input
              type="text"
              name="standard"
              value={formData.standard}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Class Type:</label>
            <div className="flex flex-wrap">
              <input
                type="text"
                name="classType"
                value={formData.classType}
                onChange={handleChange}
                placeholder="Enter class type"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, classType: '' }))}
                className="mt-2 w-full p-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Add Another Class Type
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Class Date:</label>
            <input
              type="date"
              name="classDate"
              value={formData.classDate}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
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
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Upload Class Image:</label>
            <button
              type="button"
              onClick={handleImageUpload}
              className="w-full p-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Upload Image
            </button>
            {formData.imageUrl && (
              <div className="mt-4">
                <img src={formData.imageUrl} alt="Class Image" className="max-w-full h-auto rounded-md" />
              </div>
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
      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">Class Information Submitted Successfully!</h1>
      <button
        onClick={() => router.push('/Classes')}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
      >
        Exit
      </button>
    </div>
  );
};

export default ClassesEntry;
