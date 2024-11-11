"use client";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { db } from "../../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function AddProduct() {
  const path = usePathname();
  const itemId = path.split('/')[3];
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
        itemId,
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
    <div className="container">
      <h2 className="header">Add a New Product</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="label">Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">Initial Value:</label>
          <input
            type="number"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="label">Product Image:</label>
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading}
            className={`upload-button ${uploading ? "uploading" : ""}`}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          {images.length > 0 && <img src={images[0]} alt="Product" className="image-preview" />}
        </div>
        <button
          type="submit"
          className="submit-button"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

// CSS styles
const styles = `
  .container {
    max-width: 400px;
    margin: auto;
    padding: 16px;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .header {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .input {
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.2s ease;
  }

  .input:focus {
    border-color: #4f46e5;
    outline: none;
  }

  .upload-button {
    padding: 10px;
    border-radius: 4px;
    background-color: #6366f1;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .upload-button:hover {
    background-color: #4f46e5;
  }

  .upload-button:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
  }

  .uploading {
    background-color: #a3a3a3;
    cursor: not-allowed;
  }

  .image-preview {
    margin-top: 16px;
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
  }

  .submit-button {
    padding: 12px;
    background-color: #10b981;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit-button:hover {
    background-color: #059669;
  }
`;

// Append styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
