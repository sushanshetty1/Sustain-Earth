"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc,collection, setDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../../../../firebaseConfig";
import dummyImage from "../../../../public/images/dummy-image.png";
import Loader from '../loader';
import Link from 'next/link';

const db = getFirestore(firebaseApp);

const ItemDetails = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const router = useRouter();
  const pathId = pathname.split('/').pop();
  const id = queryId || pathId;
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(dummyImage);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      try {
        if (id) {
          console.log("Fetching document with ID:", id);
          const itemRef = doc(db, "orderCollections", id);
          const itemSnapshot = await getDoc(itemRef);
          if (itemSnapshot.exists()) {
            const fetchedData = itemSnapshot.data();
            console.log("Raw Firestore data:", fetchedData);
            const fetchedItem = { id: itemSnapshot.id, ...itemSnapshot.data() };
            
            console.log("Fetched item:", fetchedItem);
            console.log("userId value:", fetchedItem.userId);
            setItem(fetchedItem);
            setMainImage(fetchedItem.images[0] || dummyImage);
          } else {
            console.error("No such document!");
          }
        }
      }
      catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (!item) {
    return <div className='flex justify-center items-center h-screen'><Loader/></div>;
  }

  let typeInfo;
  if (item.type.sell && item.type.rent) {
    typeInfo = <p>For Sale and Rent</p>;
  } else if (item.type.sell) {
    typeInfo = <p>For Sale</p>;
  } else if (item.type.rent) {
    typeInfo = <p>For Rent</p>;
  } else {
    typeInfo = <p>Type not available</p>;
  }

  const images = [
    item.images[0] || dummyImage,
    item.images[1] || dummyImage,
    item.images[2] || dummyImage,
    item.images[3] || dummyImage,
  ];

  const thumbnails = images.slice(1);

  const handleTrade = () => {
    alert('Opening trade portal. You can exchange your items here!');
    router.push(`/MarketPlace/GreenMarket/${item.id}/Trade`);
  };
  
  const handleBuyNow = () => {
    console.log("Current item state:", item);
    if (!item) {
      alert("Please wait for item data to load.");
      return;
    }
    if (!item.userId) {
      console.error("Missing userId in item:", item);
      alert("Unable to process purchase. Missing seller information.");
      return;
    }
    setShowAddressPopup(true);
  };


  const handleAddressSubmit = async () => {
    console.log("Submitting order with item:", item);

  if (!address.trim()) {
    alert("Please enter a valid address.");
    return;
    }
    
     if (!item) {
      alert("Please wait for item data to load.");
      return;
    }

    if (!item.userId) {
      console.error("Current item state:", item);
      alert("Unable to process order. Missing seller information.");
      return;
    }
    
   try {
    const confirmedOrder = {
      address: address,
      title: item.title,
      mainImage: mainImage,
      price: item.type.sell ? item.price : null,
      pricePerDay: item.type.rent ? item.pricePerDay : null,
      userId: item.userId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      itemId: id
    };

     console.log("Saving order:", confirmedOrder);
     
    const confirmedOrdersRef = doc(collection(db, "confirmedOrders")); // Auto-generate a new document ID
     await setDoc(confirmedOrdersRef, confirmedOrder);
     
     try {
      const itemRef = doc(db, "orderCollections", id);
      await deleteDoc(itemRef);
      console.log("Successfully deleted item from orderCollections");
    } catch (deleteError) {
      console.error("Delete error details:", {
        error: deleteError,
        errorMessage: deleteError.message,
        errorCode: deleteError.code,
        currentUser: currentUser.uid,
        itemId: id
      });
      // Handle the error appropriately
    }

    alert("Order confirmed and saved!");
    setShowAddressPopup(false); // Close the popup
     router.push('/MarketPlace/GreenMarket/pay'); // Redirect to the payment page
  } catch (error) {
    console.error("Error saving order: ", error);
    alert("There was an issue saving your order. Please try again.");
  }
};

if (isLoading) {
  return <div className='flex justify-center items-center h-screen'><Loader/></div>;
}

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Item not found</p>
          <Button onClick={() => router.push('/MarketPlace/GreenMarket')}>
            Return to Market
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl bg-white mt-11">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <img
              src={mainImage}
              alt="Product"
              className="w-full h-[400px] object-cover transition-opacity duration-300"
            />
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {thumbnails.map((thumb, index) => (
              <img
                key={index}
                src={thumb}
                alt={`Product view ${index + 2}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:shadow-lg hover:scale-105 transition duration-300"
                onClick={() => setMainImage(thumb)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
          <p className="text-gray-600 text-lg">
            {item.description}
          </p>

          <div className="flex items-center">
            <i className="bi bi-geo-alt-fill text-red-500 text-lg"></i>
            <span className="text-gray-700 flex items-center gap-2 ml-2">
              {item.location.city}, {item.location.state.label}
            </span>
          </div>


          <div className="space-y-2">
            {item.type.sell && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Sell Price:</span>
                <span className="text-2xl font-bold text-gray-900">₹{item.price}</span>
              </div>
            )}
            {item.type.rent && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Rent Price:</span>
                <span className="text-2xl font-bold text-green-600">₹{item.pricePerDay}/day</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
          <Button
            onClick={handleBuyNow}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300"
            aria-label="Buy Now"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              className="mr-2"
              aria-hidden="true"
            >
              <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" />
            </svg>
            Buy Now
          </Button>
          {showAddressPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6 w-96">
      <h2 className="text-xl font-bold mb-4">Enter Delivery Address</h2>
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Enter your address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div className="flex justify-between mt-4">
        <Button
          onClick={handleAddressSubmit}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Address
        </Button>
        <Button
          onClick={() => setShowAddressPopup(false)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
)}


          <Button
            onClick={handleTrade}
            className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2 p-2 rounded"
            aria-label="Trade Now"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#FFFFFF"
            >
              <path d="M280-120 80-320l200-200 57 56-104 104h607v80H233l104 104-57 56Zm400-320-57-56 104-104H120v-80h607L623-784l57-56 200 200-200 200Z" />
            </svg>
            <span>Trade Now</span>
          </Button>

          </div>

          <div className="text-sm text-gray-500 space-y-4">
              <p className="flex items-center gap-3">
                <i className="bi bi-shield-check text-green-500 text-lg"></i>
                <span className="flex items-center gap-2">
                  Secure Payment Options Available
                </span>
              </p>
              <p className="flex items-center gap-3">
                <i className="bi bi-truck text-blue-500 text-lg"></i>
                <span className="flex items-center gap-2">
                  Fast Delivery Across India
                </span>
              </p>
            </div>

        </div>
      </div>
    </main>
  );
};

export default ItemDetails;
