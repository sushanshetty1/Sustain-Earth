"use client";
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from "react";
import styled from "styled-components";
import { db } from "../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 


const Form = () => {
  const placeholderAmount = 0;
  const [amount, setAmount] = useState(placeholderAmount);
  const [upiId, setUpiId] = useState("");
  const router = useRouter(); 
  const [name, setName] = useState("");
  const path = usePathname();
  const donationId = path.split('/')[2];
  const gstRate = 0.18;
  const tax = amount * gstRate;
  const total = amount + tax;

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || placeholderAmount;
    setAmount(value);
  };

  const handleUpiIdChange = (e) => {
    setUpiId(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async () => {
    const newDonation = { name, amount: total, date: new Date() };
  
    try {
      const donationRef = doc(db, "donationCollections", donationId);
      const donationDoc = await getDoc(donationRef);
  
      if (donationDoc.exists()) {
        const currentAmount = donationDoc.data().amount || 0;
        
        await updateDoc(donationRef, {
          amount: currentAmount + total,
        });

        await addDoc(collection(db, "donationCollections", donationId, "donations"), newDonation);
  
        alert("Thank You For Your Valuable Donation!");
        router.back();
      } else {
        console.log("Donation document does not exist.");
      }
    } catch (error) {
      console.error("Error saving donation information: ", error);
      alert("Failed to save donation information. Please try again.");
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className="card cart">
          <label className="title">DONATE</label>
          <div className="steps">
            <div className="step">
              <span>Enter Your Name</span>
              <input
                type="text"
                className="input_field"
                placeholder="Your name"
                value={name}
                onChange={handleNameChange}
              />
            </div>
            <div className="step">
              <span>Enter The Amount To Donate</span>
              <input
                type="number"
                className="input_field"
                min={0}
                placeholder={`Amount in INR (${placeholderAmount})`}
                onChange={handleAmountChange}
              />
            </div>
            <div className="step">
              <div className="payment-method">
                <span>PAYMENT METHOD</span>
                <p>UPI</p>
                <input
                  type="text"
                  className="input_field"
                  placeholder="Enter your UPI ID (e.g., user@upi)"
                  value={upiId}
                  onChange={handleUpiIdChange}
                />
              </div>
              <hr />
              <div className="payments">
                <span>PAYMENT SUMMARY</span>
                <div className="details">
                  <span>Subtotal:</span>
                  <span>₹{amount.toFixed(2)}</span>
                  <span>Tax (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card checkout">
          <div className="footer">
            <label className="price">₹{total.toFixed(2)}</label>
            <button className="checkout-btn" onClick={handleSubmit}>
              Proceed to Donate
            </button>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 500px;
    gap: 20px;
  }

  .card {
    width: 100%;
    background: #fffdf5;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    padding: 20px;
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    color: #104356;
    margin-bottom: 20px;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .step span {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .input_field {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #a0a0a0;
    transition: all 0.3s ease-in-out;
    background-color: #fbf3e4;
  }

  .input_field:focus {
    border-color: #104356;
    background-color: #e8e4db;
    outline: none;
  }

  .payment-method p {
    margin: 5px 0;
    color: #555;
  }

  .payments {
    padding-top: 10px;
  }

  .payments .details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 15px;
  }

  .payments .details span {
    font-size: 13px;
    color: #333;
  }

  hr {
    margin: 10px 0;
    border: none;
    border-top: 1px solid #ccc;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
  }

  .price {
    font-size: 20px;
    font-weight: bold;
    color: #104356;
  }

  .checkout-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background-color: #104356;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .checkout-btn:hover {
    background-color: #0c3a45;
  }
`;

export default Form;
