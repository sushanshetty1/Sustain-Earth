"use client";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../../../firebaseConfig";
import Link from 'next/link';

const db = getFirestore(firebaseApp);

const ItemDetails = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id'); 
  const pathId = pathname.split('/').pop();
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
    <div className="container mx-auto p-4 sm:p-6 mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-left">
            <p className="font-bold inline-block"></p>
            <p>
              📌 {item.location.city}, {item.location.state.label}
            </p>
          </div>
          <hr />
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-72 sm:h-96 object-fit rounded-lg border"
          />
          <div className='h-36 sm:h-44 flex gap-2 sm:gap-5 flex-row justify-between mt-4 w-full'>
            <div className='w-1/3 rounded-lg h-full'></div>
            <div className='w-1/3 rounded-lg h-full'></div>
            <div className='w-1/3 rounded-lg h-full'></div>
          </div>
        </div>
        <div className='md:flex-col md:mt-12 md:text-right md:items-end flex flex-col text-center items-center'>
          <h2 className="text-2xl sm:text-3xl font-semibold">{item.title}</h2>
          <div className="border p-2 my-3 sm:my-4 w-full md:w-auto">
            <p className="text-gray-700">{item.description}</p>
          </div>
          <div>
            {item.type.sell && <p className="text-lg font-medium mt-2">Price: {item.price}</p>}
            {item.type.rent && <p className="text-lg font-medium mt-2">Price per day: {item.pricePerDay}</p>}
          </div>
          <div className="text-center mt-4 flex gap-4 sm:gap-10 flex-wrap justify-center">
            <Link href="/MarketPlace/GreenMarket/pay" target="_blank">
              <button className="Btn">Buy Now</button>
            </Link>
            <Link href={`/MarketPlace/GreenMarket/${item.id}/Trade`} target="_blank">
              <button className="Btn">Trade Now</button>
            </Link>
          </div>
        </div>
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
