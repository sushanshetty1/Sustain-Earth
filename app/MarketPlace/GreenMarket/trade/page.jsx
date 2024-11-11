"use client"
import { useState, useEffect } from "react";
import { db } from "../../../../firebaseConfig"; // Adjust the path if needed
import { collection, addDoc } from "firebase/firestore";

export default function AddProduct() {
  const [productName, setProductName] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadCloudinaryScript = () => {
      if (!window.cloudinary) {
        const script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.onload = () => console.log("Cloudinary script loaded successfully");
        document.body.appendChild(script);
      }
    };
    loadCloudinaryScript();
  }, []);

  const handleImageUpload = () => {
    if (window.cloudinary) {
      setUploading(true);
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
          setUploading(false);
          if (error) {
            alert("Error uploading images.");
            return;
          }
          if (result && result.event === "success") {
            setImages([result.info.secure_url]);
          }
        }
      );
    } else {
      alert("Cloudinary widget is not available.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !initialValue || images.length === 0) {
      alert("Please fill out all fields and upload an image.");
      return;
    }

    try {
      const productData = {
        productName,
        initialValue,
        images,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "Trades"), productData);
      alert("Product added successfully!");
      setProductName("");
      setInitialValue("");
      setImages([]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("There was an error adding the product. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Add a New Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Initial Value:</label>
          <input
            type="number"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Product Image:</label>
          <button type="button" onClick={handleImageUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {images.length > 0 && <img src={images[0]} alt="Product" width="100" />}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
