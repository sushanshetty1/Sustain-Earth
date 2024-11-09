"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../../../firebaseConfig";

const db = getFirestore(firebaseApp);

const SellNRent = () => {
  const [view, setView] = useState("add");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("Men");
  const [productPrice, setProductPrice] = useState(0);
  const [productPricePerDay, setProductPricePerDay] = useState(0);
  const [productStock, setProductStock] = useState(0);
  const [productSizes, setProductSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [productType, setProductType] = useState({
    sell: false,
    rent: false,
  });
  const [productCity, setProductCity] = useState("");
  const [productState, setProductState] = useState("");

  const categoryOptions = [
    "Electronics", "Computers & Accessories", "Mobile Phones & Accessories", "Home Appliances", "Furniture",
    "Clothing & Apparel", "Shoes & Footwear", "Jewelry & Watches", "Beauty & Personal Care", "Health & Wellness",
    "Groceries & Food", "Books & Stationery", "Sports & Outdoors", "Toys & Games", "Baby Products",
    "Automotive & Motorcycles", "Office Supplies", "Pet Supplies", "Garden & Outdoor", "Tools & Home Improvement",
    "Art & Craft Supplies", "Home Decor", "Lighting & Ceiling Fans", "Kitchen & Dining", "Bags & Luggage",
    "Musical Instruments", "Movies & Entertainment", "Video Games & Consoles", "Software", "Industrial & Scientific",
    "Building Materials", "Smart Home Devices", "Camping & Hiking", "Photography & Videography", "Fishing Gear",
    "Bicycles & Accessories", "Water Sports", "Skincare", "Makeup", "Hair Care", "Fragrances", "Men's Fashion",
    "Women's Fashion", "Children's Clothing", "Men's Accessories", "Women's Accessories", "Household Supplies",
    "Cleaning Supplies", "Medical Supplies", "Party Supplies", "Holiday Decorations", "Collectibles & Memorabilia",
    "Educational Supplies", "Safety & Security", "Seasonal & Holiday Items", "Energy & Solar Products",
    "Bedding & Bath", "Storage & Organization", "Travel Accessories", "Green & Eco-Friendly", "Luxury Goods",
    "CBD & Wellness Products", "Craft Beer & Specialty Drinks", "Wine & Spirits", "Organic & Natural Food",
    "Specialty Food & Beverages", "Coffee & Tea", "Meat & Seafood", "Snacks & Confectionery",
    "Vegetarian & Vegan Options", "Dairy & Eggs", "Bakery & Desserts", "Frozen Foods", "Pantry Essentials",
    "Condiments & Sauces", "Canned & Jarred Foods", "Pet Food & Treats", "Pet Grooming Supplies", "Fitness Equipment",
    "Yoga & Meditation", "Outdoor Power Equipment", "Pool & Spa Supplies", "Grills & Outdoor Cooking",
    "Renewable Energy Supplies", "Batteries & Power Banks", "Bags & Cases for Electronics", "Car & Vehicle Electronics",
    "Wearable Technology", "VR & AR Devices", "Hobbies & Collectibles", "RC Vehicles & Drones",
    "Scale Models & Miniatures", "Board Games & Puzzles", "Party Games", "Fishing Gear & Tackle",
    "Motorcycle Parts & Accessories", "Car Care & Maintenance", "Replacement Parts", "Outdoor Lighting",
    "Small Kitchen Appliances", "Major Kitchen Appliances", "Bedding", "Bathroom Accessories",
    "Wallpaper & Painting Supplies", "Curtains & Window Treatments", "Decorative Accents",
    "Artificial Plants & Flowers", "Coffee Makers", "Wine Coolers", "Blenders & Juicers", "Television & Home Theater",
    "Soundbars & Speakers", "Cables & Connectors", "Guitar & Bass", "Keyboards & Pianos", "DJ & Lighting Equipment",
    "Drums & Percussion", "Brass & Woodwind Instruments", "Educational Toys", "Learning Aids", "Puzzles",
    "Dolls & Action Figures", "Remote-Controlled Toys", "Baby Care Products", "Diapering & Potty Training",
    "Strollers & Prams", "Nursery Furniture", "Travel Gear for Babies", "Special Needs Products", "DIY & Crafts",
    "Beads & Jewelry Making", "Sewing & Knitting", "Drawing & Painting Supplies", "School Supplies",
    "Office Electronics", "Presentation Supplies", "Legal Forms & Kits", "Resume & Career Resources",
    "Business & Marketing Supplies"
  ].map((category) => ({ value: category, label: category }));

  const stateOptions = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh", "West Bengal"
  ].map((state) => ({ value: state, label: state }));

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
          multiple: true,
          resourceType: "image",
        },
        (error, result) => {
          setUploading(false);
          if (error) {
            alert("Error uploading images.");
            return;
          }
          if (result && result.event === "success") {
            setImages((prevImages) => [...prevImages, result.info.secure_url]);
          }
        }
      );
    } else {
      alert("Cloudinary widget is not available.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!productName || images.length === 0) || (!productType.sell && !productType.rent)) {
      alert("Please fill in all required fields!");
      return;
    }
    try {
      const newOrder = {
        title: productName,
        description: productDescription,
        category: productCategory.label,
        price: productType.sell ? productPrice : null,
        pricePerDay: productType.rent ? productPricePerDay : null,
        stock: productStock,
        sizes: productSizes,
        images,
        type: productType,
        location: {
          city: productCity,
          state: productState,
        },
        date: new Date().toLocaleDateString(),
      };
      await addDoc(collection(db, "orderCollections"), newOrder);
      alert("Item added successfully!");

      setProductName("");
      setProductDescription("");
      setProductCategory("Men");
      setProductPrice(0);
      setProductStock(0);
      setProductSizes([]);
      setImages([]);
      setProductType({ sell: false, rent: false }); // Reset product type
    } catch (error) {
      alert("Error adding item.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto bg-gray-50 mt-10">
      <div className="w-full lg:w-1/4 bg-white p-6 border-b lg:border-r border-gray-200 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Navigation</h2>
        <button
          onClick={() => setView("add")}
          className="w-full text-left py-3 px-5 mb-3 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          Add Item
        </button>
        <button
          onClick={() => setView("orders")}
          className="w-full text-left py-3 px-5 mb-3 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          Orders
        </button>
      </div>

      <div className="flex-grow p-8 bg-white">
        {view === "add" ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Product Description</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                  rows="4"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <Select
                  value={productCategory}
                  onChange={setProductCategory}
                  options={categoryOptions}
                  className="w-full"
                  isSearchable
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Product Type</label>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={productType.sell}
                    onChange={() => setProductType({ ...productType, sell: !productType.sell })}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm">For Sale</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productType.rent}
                    onChange={() => setProductType({ ...productType, rent: !productType.rent })}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm">For Rent</span>
                </div>
              </div>

              {/* Dynamic fields for sale and rent */}
              {productType.sell && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Price (Sale)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
              )}
              {productType.rent && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Price Per Day (Rent)</label>
                  <input
                    type="number"
                    value={productPricePerDay}
                    onChange={(e) => setProductPricePerDay(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Product Sizes (Optional)</label>
                <input
                  type="text"
                  value={productSizes}
                  onChange={(e) => setProductSizes(e.target.value.split(","))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Enter sizes separated by commas"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Product Images</label>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  {uploading ? "Uploading..." : "Upload Images"}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={productCity}
                  onChange={(e) => setProductCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">State</label>
                <Select
                  value={productState}
                  onChange={setProductState}
                  options={stateOptions}
                  className="w-full"
                  isSearchable
                />
              </div>

              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Orders</h2>
            {/* Orders content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellNRent;
