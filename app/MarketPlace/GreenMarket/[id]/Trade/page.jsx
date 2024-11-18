"use client"
import { useState, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { db, auth,doc } from "../../../../../firebaseConfig"; 
import { collection, addDoc, setDoc ,updateDoc,arrayUnion } from "firebase/firestore";
import styles from './AddProduct.module.css';

export default function AddProduct() {
  const path = usePathname();
  const itemId = path.split('/')[3];
  const router = useRouter(); 
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
        userId: auth.currentUser.uid,
        productName,
        initialValue,
        images,
        createdAt: new Date(),
        itemId,
        TradeRequests: [] 
      };
  
      const tradeRequest = {
        createdAt: new Date(),
        images,
        initialValue,
        itemId,
        productName,
        userId: auth.currentUser.uid,
      };
  
      const productRef = doc(db, "orderCollections", itemId);
  
      await updateDoc(productRef, {
        TradeRequests: arrayUnion(tradeRequest)
      });
  
      alert("Product added successfully!");
  
      setProductName("");
      setInitialValue("");
      setImages([]);
      router.push("/MarketPlace/GreenMarket");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("There was an error adding the product. Please try again.");
    }
  };
  
  return (
    <div className="mt-10">
    <div className={styles.container}>
      <h2 className={styles.header}>Add a New Product</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles["form-group"]}>
          <label className={styles.label}>Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles["form-group"]}>
          <label className={styles.label}>Initial Value:</label>
          <input
            type="number"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles["form-group"]}>
          <label className={styles.label}>Product Image:</label>
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading}
            className={`${styles["upload-button"]} ${uploading ? styles.uploading : ""}`}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {images.length > 0 && <img src={images[0]} alt="Product" className={styles["image-preview"]} />}
        </div>
        <button
          type="submit"
          className={styles["submit-button"]}
        >
          Submit
        </button>
      </form>
    </div>
    </div>
  );
}
