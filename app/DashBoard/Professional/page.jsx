"use client";
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const App = () => {
  const [formData, setFormData] = useState({
    teacherName: "",
    schoolName: "",
    frontCardImage: "",
    backCardImage: "",
  });
  const [uploading, setUploading] = useState({
    front: false,
    back: false,
  });

  useEffect(() => {
    const user = getAuth().currentUser;

    if (user) {
      setFormData((prev) => ({
        ...prev,
        teacherName: user.displayName || "",
      }));
    }

    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (imageType) => {
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
      (error, result) => {
        setUploading((prev) => ({ ...prev, [imageType]: false }));
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          alert("Error uploading image.");
          return;
        }
        if (result.event === "success") {
          setFormData((prev) => ({
            ...prev,
            [imageType]: result.info.secure_url,
          }));
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const db = getFirestore();
    const user = getAuth().currentUser;

    if (user) {
      try {
        await addDoc(collection(db, "professionalVerification"), {
          userId: user.uid,
          teacherName: formData.teacherName,
          schoolName: formData.schoolName,
          frontCardImage: formData.frontCardImage,
          backCardImage: formData.backCardImage,
        });
        console.log("Form Data Submitted and Stored in Firestore:", formData);
        alert("Form data submitted successfully.");
      } catch (error) {
        console.error("Error adding document:", error);
        alert("Error submitting form.");
      }
    } else {
      alert("User not authenticated.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-[#f9f6f4]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-black mb-6">
          Professional Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="teacherName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name:
            </label>
            <input
              type="text"
              id="teacherName"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleChange}
              readOnly
              placeholder="Your full name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-700 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="schoolName"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name:
            </label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter your Company name"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Front ID Card:
            </label>
            <button
              type="button"
              onClick={() => handleImageUpload("frontCardImage")}
              disabled={uploading.front}
              className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uploading.front ? "Uploading..." : "Upload Front Card"}
            </button>
            {formData.frontCardImage && (
              <div className="mt-4">
                <img
                  src={formData.frontCardImage}
                  alt="Front Card"
                  className="w-full h-40 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Back ID Card:
            </label>
            <button
              type="button"
              onClick={() => handleImageUpload("backCardImage")}
              disabled={uploading.back}
              className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uploading.back ? "Uploading..." : "Upload Back Card"}
            </button>
            {formData.backCardImage && (
              <div className="mt-4">
                <img
                  src={formData.backCardImage}
                  alt="Back Card"
                  className="w-full h-40 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
