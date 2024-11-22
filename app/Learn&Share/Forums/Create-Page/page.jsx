"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../firebaseConfig";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

const Form = () => {
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = () => setCloudinaryLoaded(true);
      script.onerror = () => console.error("Cloudinary script failed to load.");
      document.body.appendChild(script);
    } else {
      setCloudinaryLoaded(true);
    }
  }, []);

  const handleImageUpload = () => {
    if (cloudinaryLoaded && window.cloudinary) {
      window.cloudinary.openUploadWidget(
        {
          cloudName: "dwkxh75ux",
          uploadPreset: "postspic",
          sources: ["local", "url", "camera"],
          cropping: true,
          multiple: false,
          resourceType: "image",
        },
        (error, result) => {
          if (error) {
            console.error("Upload error:", error);
          } else if (result && result.event === "success") {
            console.log("Image uploaded:", result.info.secure_url);
            setImageUrl(result.info.secure_url);
          } else {
            console.log("Unexpected result:", result);
          }
        }
      );
    } else {
      console.log("Cloudinary is not loaded yet.");
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
        console.error("User not logged in!");
        return;
    }

    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();

            let balance = userData.balance || 0;
            let dailyBalance = userData.dailyBalance || 0;
            const currentDate = new Date().toDateString();

            if (dailyBalance < 250) {
                const increment = Math.min(25, 250 - dailyBalance);
                dailyBalance += increment;

                balance += 25;

                const balanceHistory = userData.balanceHistory || [];
                const newHistoryEntry = {
                    balance,
                    date: currentDate,
                };
                balanceHistory.push(newHistoryEntry);

                await updateDoc(userDocRef, {
                    balance,
                    dailyBalance,
                    balanceHistory,
                });
            }

            const postsCollectionRef = collection(db, 'posts');
            await addDoc(postsCollectionRef, {
                title: title,
                content: content,
                imageUrl: imageUrl,
                views: 0,
                likes: 0,
                comments: [],
                time: new Date().toLocaleString(),
                userId: user.uid,
                name: userData.firstName || "Unknown User",
                profilePic: userData.profilePic || "Pic",
            });

            setTitle('');
            setContent('');
            setImageUrl('');

            router.back(); 
        } else {
            console.error("User not found in database!");
        }
    } catch (error) {
        console.error("Error adding post: ", error);
    }
};


  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        className="bg-white w-[90vw] md:w-[50vw] p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            placeholder="Enter title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Content
          </label>
          <textarea
            rows={5}
            id="content"
            placeholder="Enter your content"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-sm hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Post
          </button>
          <div className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-current text-gray-700 mr-2 cursor-pointer"
              onClick={handleImageUpload}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <g strokeWidth={0} id="SVGRepo_bgCarrier" />
                <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier" />
                <g id="SVGRepo_iconCarrier">
                  <path
                    fill="#0F0F0F"
                    d="M23 4C23 2.34315 21.6569 1 20 1H4C2.34315 1 1 2.34315 1 4V20C1 21.6569 2.34315 23 4 23H20C21.6569 23 23 21.6569 23 20V4ZM21 4C21 3.44772 20.5523 3 20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4Z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                  <path
                    fill="#0F0F0F"
                    d="M4.80665 17.5211L9.1221 9.60947C9.50112 8.91461 10.4989 8.91461 10.8779 9.60947L14.0465 15.4186L15.1318 13.5194C15.5157 12.8476 16.4843 12.8476 16.8682 13.5194L19.1451 17.5039C19.526 18.1705 19.0446 19 18.2768 19H5.68454C4.92548 19 4.44317 18.1875 4.80665 17.5211Z"
                  />
                  <path
                    fill="#0F0F0F"
                    d="M18 8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8Z"
                  />
                </g>
              </svg>
            </svg>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
