"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebaseConfig"; // Adjust the path if needed
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Sidebar() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user document from Firestore using user ID
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  return (
    <div className="w-1/4 flex h-screen bg-white">
      <div className="w-1/4 fixed hidden md:flex h-full p-4 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white mb-4 flex items-center justify-center">
            <span className="text-lg font-bold">Pic</span>
          </div>
          <p className="font-bold text-center">
            {userData ? userData.firstName +" "+ userData.lastName : "Guest"}
          </p>
          <p className="text-gray-500 text-center">
            {userData ? `@${userData.username}` : "@username"}
          </p>

          <div className="mt-8 flex flex-col space-y-4 w-full">
            <button className="bg-black text-white py-2 px-4 rounded-lg w-40 flex items-center justify-start">
              <span>📰</span>
              <span className="ml-2">New Feeds</span>
            </button>
            <button className="py-2 px-4 rounded-lg flex items-center justify-start">
              <span>⚙️</span>
              <span className="ml-2">My posts</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex md:hidden items-center left-3 flex-col fixed h-full w-fit">
        <button className="h-20 w-16 font-bold rounded">+</button>
        <button className="h-20 w-16 font-bold rounded">$</button>
      </div>
    </div>
  );
}

export default Sidebar;
