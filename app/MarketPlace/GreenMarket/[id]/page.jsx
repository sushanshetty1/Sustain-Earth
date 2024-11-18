"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../../firebaseConfig";
import dummyImage from "../../../../public/images/dummy-image.png";
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
  const [mainImage, setMainImage] = useState(dummyImage);

  useEffect(() => {
    const fetchItem = async () => {
      if (id) {
        const itemRef = doc(db, "orderCollections", id);
        const itemSnapshot = await getDoc(itemRef);
        if (itemSnapshot.exists()) {
          const fetchedItem = { id: itemSnapshot.id, ...itemSnapshot.data() };
          setItem(fetchedItem);
          setMainImage(fetchedItem.images[0] || dummyImage);
        } else {
          console.error("No such document!");
        }
      }
    };
    fetchItem();
  }, [id]);

  if (!item) {
    return <div>Loading...</div>;
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

  const handleBuyNow = () => {
    const choice = confirm('Do You Wish To Continue With Buy Now?');
    if (choice) {
      alert('Proceeding to buy for ₹' + item.price + '...');
    } else {
      alert('Proceeding to rent for ₹' + item.pricePerDay + '...');
    }
    router.push('/MarketPlace/GreenMarket/pay');
  };

  const handleTrade = () => {
    alert('Opening trade portal. You can exchange your items here!');
    router.push(`/MarketPlace/GreenMarket/${item.id}/Trade`);
  };

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
            <span className="text-gray-700 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#EA3323"
              >
                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
              </svg>
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
            <i className="bi bi-cart-fill mr-2" aria-hidden="true" />
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

          <Button
            onClick={handleTrade}
            className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2 p-2 rounded"
            aria-label="Trade Now"
          >
            <i className="bi bi-arrow-left-right" />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="#75FB4C"
                  >
                    <path d="m438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z" />
                  </svg>
                  Secure Payment Options Available
                </span>
              </p>
              <p className="flex items-center gap-3">
                <i className="bi bi-truck text-blue-500 text-lg"></i>
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="#789DE5"
                  >
                    <path d="M240-160q-50 0-85-35t-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T280-280q0-17-11.5-28.5T240-320q-17 0-28.5 11.5T200-280q0 17 11.5 28.5T240-240ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm600 120q17 0 28.5-11.5T760-280q0-17-11.5-28.5T720-320q-17 0-28.5 11.5T680-280q0 17 11.5 28.5T720-240Zm-40-200h170l-90-120h-80v120ZM360-540Z" />
                  </svg>
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
