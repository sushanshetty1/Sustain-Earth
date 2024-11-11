"use client"
import { usePathname,useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../../firebaseConfig";
import Link from 'next/link';

const db = getFirestore(firebaseApp);

const ItemDetails = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id'); 
  const pathId= pathname.split('/').pop();


  const id = queryId || pathId;
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (id) {
        const itemRef = doc(db, "orderCollections", id);
        const itemSnapshot = await getDoc(itemRef);
        if (itemSnapshot.exists()) {
          setItem({ id: itemSnapshot.id, ...itemSnapshot.data() });
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

  return (
    <div className="container mx-auto p-6 mt-7">
      <div className="grid grid-cols-2 gap-4"> {/* Use grid for layout */}
        <div>
          <div className="text-left"> {/* Align text to the left */}
            <p className="font-bold">ITEM'S CURRENT LOCATION:</p>
            <p>
              {item.location.city}, {item.location.state.label}
            </p>
          </div>
          <hr /> {/* Add a horizontal line */}
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg border" // Add border to image
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-right">{item.title}</h2> {/* Align title to the right */}
          <div className="border p-2"> {/* Add border to description */}
            <p className="text-gray-700">{item.description}</p>
          </div>
          <div className="text-right"> {/* Align price information to the right */}
            {item.type.sell && <p className="text-lg font-medium mt-2">Price: {item.price}</p>}
            {item.type.rent && <p className="text-lg font-medium mt-2">Price per day: {item.pricePerDay}</p>}
          </div>
        </div>
      </div>
      <div className="text-center mt-4 flex gap-10"> {/* Center the button */}
      <Link href="/MarketPlace/GreenMarket/pay" target="_blank">
        <button className="Btn">
            Buy Now
        </button>
        </Link>
        <Link href={`/MarketPlace/GreenMarket/${item.id}/Trade`} target="_blank">
        <button className=" Btn">
            Trade Now
        </button>
        </Link>
      </div>
      
      <style jsx>{` 
      .Btn {
  width: 130px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(15, 15, 15);
  border: none;
  color: white;
  font-weight: 600;
  gap: 8px;
  cursor: pointer;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.103);
  position: relative;
  overflow: hidden;
  transition-duration: .3s;
}

.Btn::before {
  width: calc(100% + 40px);
  aspect-ratio: 1/1;
  position: absolute;
  content: "";
  background-color: white;
  border-radius: 50%;
  left: -20px;
  top: 50%;
  transform: translate(-150%, -50%);
  transition-duration: .5s;
  mix-blend-mode: difference;
}

.Btn:hover::before {
  transform: translate(0, -50%);
}

.Btn:active {
  transform: translateY(4px);
  transition-duration: .3s;
}

      `}</style>
    </div>
  );
};

export default ItemDetails;