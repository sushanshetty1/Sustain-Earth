"use client";
import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../../firebaseConfig";
import styled from 'styled-components';
import Loader
 from "./loader";
const db = getFirestore(firebaseApp);

const GreenMarket = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsCollection = collection(db, "orderCollections");
      const itemSnapshot = await getDocs(itemsCollection);
      const itemList = itemSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemList);
      setLoading(false);
    };
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-6 mt-7 mb-[150px]">
      <h1 className="text-3xl text-center font-semibold mb-6">
      Empower your choices—buy, rent, and share for a more sustainable tomorrow.
      </h1>
      {loading ? (
        <CenterBox>
          <Loader className="flex justify-center items-center h-[13em]" />
        </CenterBox>
      ) : items.length === 0 ? (
        <CenterBox>
          <p>No items available</p>
        </CenterBox>
      ) : (
        <ItemGrid>
          {items.map(item => (
            <a key={item.id} href={`/MarketPlace/GreenMarket/${item.id}?id=${item.id}`}>
              <Card>
                <div className="card-img">
                  {item.images ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '1rem'
                      }}
                    />
                  ) : (
                    <PlaceholderImage />
                  )}
                  <LabelWrapper>
                    {item.type?.sell && <Label className="sell">For Sale</Label>}
                    {item.type?.rent && <Label className="rent">For Rent</Label>}
                  </LabelWrapper>
                </div>
                <div className="card-info">
                  <p className="text-title">{item.title}</p>
                  <p className="text-body">{item.description}</p>
                </div>
                <div className="card-footer">
                  <span className="text-title">
                    {item.type?.sell && <div>For Sale: {item.price}</div>}
                    {item.type?.rent && <div>For Rent: {item.pricePerDay}/day</div>}
                    {!item.type?.sell && !item.type?.rent && <div>Price not available</div>}
                  </span>
                  <div className="card-button">
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z" />
                      <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z" />
                      <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z" />
                    </svg>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </ItemGrid>
      )}
    </div>
  );
};


const PlaceholderImage = () => (
  <div style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    color: '#555'
  }}>
    No Image
  </div>
);

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); // Responsive grid layout
  gap: 20px; // Spacing between grid items
`;

const Card = styled.div`
  display: flex;
  flex-direction: column; // Stack elements vertically
  width: 100%;
  background: #f5f5f5; // Light background color
  padding: 1.2em; // Padding within the card
  border-radius: 1rem; // Rounded corners
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); // Subtle shadow effect
  transition: transform 0.3s ease, box-shadow 0.3s ease; // Smooth transitions on hover
  height: 100%; // Ensure the card takes the full height of its container

  &:hover {
    transform: translateY(-5px); // Slight upward movement on hover
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // More pronounced shadow on hover
  }

  .card-img {
    background-color: #ffcaa6; // Peachy background color for the image container
    height: 250px;
    width: 100%;
    border-radius: 1rem;
    position: relative; // To position labels absolutely
    transition: transform 0.3s ease; // Smooth transition for image hover effect
  }

  .card-info {
    flex-grow: 1; // Allow this section to expand and take available space
    padding-top: 15%; // Spacing between image and text content
  }

  .card-footer {
    display: flex;
    justify-content: space-between; // Distribute space between price and button
    align-items: center; // Vertically align items
    padding-top: 15px;
    border-top: 1px solid #ddd; // Subtle separator line
    margin-top: auto; // Push footer to the bottom of the card
  }

  .text-title {
    font-weight: 700; // Bold text
    font-size: 1.2em;
    line-height: 1.5; // Line spacing
  }

  .text-body {
    font-size: 1em;
    margin-bottom: 10px; // Spacing below the description
  }

  .card-button {
    border: 1px solid #252525; // Dark border
    display: flex;
    padding: 0.3em;
    cursor: pointer; // Indicate that it's clickable
    border-radius: 50px; // Rounded button
    transition: background-color 0.3s ease; // Smooth background transition on hover
  }

  .card-button:hover {
    background-color: #ffcaa6; // Peachy background on hover
  }

  svg {
    width: 20px;
    height: 20px; // Size of the SVG icon
  }

  .card-img:hover {
    transform: translateY(-10%); // Move the image up slightly on hover
    box-shadow: rgba(226, 196, 63, 0.25) 0px 13px 47px -5px, rgba(180, 71, 71, 0.3) 0px 8px 16px -8px; // Enhanced shadow effect on hover
  }
`;


const LabelWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px; // Spacing between labels
`;

const Label = styled.span`
  padding: 5px 10px;
  border-radius: 15px; // Rounded corners
  font-weight: bold;
  color: black;
  font-size: 14px;

  &.sell {
    background-color: #ff6f61; // Reddish background for "For Sale"
  }

  &.rent {
    background-color: #ffd700; // Yellow background for "For Rent"
  }
`;

const CenterBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;  // Makes the box take up the full height of its container
  text-align: center;
`;
export default GreenMarket;