"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../firebaseConfig";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";  //here
import styled from 'styled-components';

const EditPostPage = () => {
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [userId, setUserId] = useState("");  //here
  const router = useRouter();
  const { id } = useParams();
  const auth = getAuth();            //here
  const currentUser = auth.currentUser;   //here

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDocRef = doc(db, "posts", id);
        const docSnap = await getDoc(postDocRef);
        if (docSnap.exists()) {
          const postData = docSnap.data();
          setTitle(postData.title);
          setContent(postData.content);
          setImageUrl(postData.imageUrl);
          setUserId(postData.userId);  //here
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [id]);

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
            setImageUrl(result.info.secure_url);
          }
        }
      );
    } else {
      console.log("Cloudinary is not loaded yet.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      console.error("User is not logged in.");
      return;
    }

    try {
      const postDocRef = doc(db, "posts", id);
      // await updateDoc(postDocRef, {
      //   title,
      //   content,
      //   imageUrl,
      // });
      // router.back();
      const updateData = {
        title,
        content,
        imageUrl,
      };

      if (!userId) {
        updateData.userId = currentUser.uid;
      }

      await updateDoc(postDocRef, updateData);
      router.back(); 
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        className="bg-white w-[90vw] md:w-[50vw] p-6 rounded-lg shadow-md"
        onSubmit={handleSave}
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
        
        {imageUrl && (
          <div className="flex justify-center mb-4">
            <img src={imageUrl} alt="Post" className="h-[200px] w-[400px] object-cover rounded" />
          </div>
        )}
        
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

        <div className="flex items-center justify-center mb-4">
        <StyledWrapper>
          <button
            type="button"
            onClick={handleImageUpload}
            className="btn text-sm"
          >
            Upload Image
          </button>
        </StyledWrapper>
        </div>
        <div className="flex items-center justify-center mb-4">
        <StyledWrapper>
        <button
          type="submit"
          className="btn text-sm"
        >
          Save Changes
        </button>
        </StyledWrapper>
        </div>
      </form>
    </div>
  );
};


const StyledWrapper = styled.div`
  .btn {
   width: 7em;
   height: 2.7em;
   margin: 0.5em;
   text-align: center;
   display: inline-block;
   background: black;
   color: white;
   border: none;
   border-radius: 0.625em;
   font-size: 16px;
   font-weight: bold;
   cursor: pointer;
   position: relative;
   z-index: 1;
   overflow: hidden;
  }

  button:hover {
   color: black;
  }

  button:after {
   content: "";
   background: white;
   position: absolute;
   z-index: -1;
   left: -20%;
   right: -20%;
   top: 0;
   bottom: 0;
   transform: skewX(-45deg) scale(0, 1);
   transition: all 0.5s;
  }

  button:hover:after {
   transform: skewX(-45deg) scale(1, 1);
   -webkit-transition: all 0.5s;
   transition: all 0.5s;
  }`;


export default EditPostPage;
