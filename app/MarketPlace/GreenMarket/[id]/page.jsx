"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePathname, useSearchParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../../firebaseConfig";
import dummyImage from "../../../../public/images/dummy-image.png";
const db = getFirestore(firebaseApp);

const ItemDetails = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id'); 
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
          setMainImage(fetchedItem.images[0] || dummyImage); // Set main image after data is fetched
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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
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

          <div className="flex items-center space-x-4">
            <i className="bi bi-geo-alt-fill text-red-500" />
            <span className="text-gray-700">{item.location.city}, {item.location.state.label}</span>
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
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <i className="bi bi-cart-fill mr-2" />
              Buy Now
            </Button>

            <Button
              onClick={handleTrade}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <i className="bi bi-arrow-left-right mr-2" />
              Trade Now
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p className="flex items-center gap-2">
              <i className="bi bi-shield-check text-green-500" />
              Secure Payment Options Available
            </p>
            <p className="flex items-center gap-2">
              <i className="bi bi-truck text-blue-500" />
              Fast Delivery Across India
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ItemDetails;
