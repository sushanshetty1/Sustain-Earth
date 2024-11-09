"use client"
import React, { useState } from "react";

const AddItemForm = () => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isBestseller, setIsBestseller] = useState(false);

  const sizes = ["S", "M", "L", "XL", "XXL"];

  const handleSizeClick = (size) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size]
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    console.log({
      productName,
      productDescription,
      category,
      subCategory,
      price,
      selectedSizes,
      isBestseller,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-6 bg-gray-50 max-w-lg mx-auto space-y-4">
      <label className="block text-gray-700 font-semibold mb-2">Upload Image</label>
      <div className="flex space-x-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border-dashed border-2 border-gray-300 w-20 h-20 flex items-center justify-center text-gray-400"
          >
            Upload
          </div>
        ))}
      </div>

      <label className="block text-gray-700 font-semibold mb-2">Product name</label>
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Type here"
        className="w-full p-2 border rounded-md"
      />

      <label className="block text-gray-700 font-semibold mb-2">Product description</label>
      <textarea
        value={productDescription}
        onChange={(e) => setProductDescription(e.target.value)}
        placeholder="Write content here"
        className="w-full p-2 border rounded-md"
      ></textarea>

      <div className="flex space-x-4">
        <div className="w-1/3">
          <label className="block text-gray-700 font-semibold mb-2">Product category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div className="w-1/3">
          <label className="block text-gray-700 font-semibold mb-2">Sub category</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Footwear">Footwear</option>
          </select>
        </div>

        <div className="w-1/3">
          <label className="block text-gray-700 font-semibold mb-2">Product Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25"
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <label className="block text-gray-700 font-semibold mb-2">Product Sizes</label>
      <div className="flex space-x-2 mb-4">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`px-4 py-2 border rounded-md ${
              selectedSizes.includes(size) ? "bg-gray-200" : "bg-white"
            }`}
            onClick={() => handleSizeClick(size)}
          >
            {size}
          </button>
        ))}
      </div>

      <label className="flex items-center space-x-2 text-gray-700 font-semibold">
        <input
          type="checkbox"
          checked={isBestseller}
          onChange={(e) => setIsBestseller(e.target.checked)}
          className="form-checkbox"
        />
        <span>Add to bestseller</span>
      </label>

      <button
        type="submit"
        className="w-full mt-4 py-2 bg-black text-white font-semibold rounded-md"
      >
        ADD
      </button>
    </form>
  );
};

export default AddItemForm;
