"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import styled from "styled-components";
import { db } from "../../../../firebaseConfig";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Form = () => {
  const placeholderAmount = 0;
  const [amount, setAmount] = useState(placeholderAmount);
  const [helpPercentage, setHelpPercentage] = useState(12);
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();
  const path = usePathname();
  const donationId = path.split('/')[2];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        alert("User is not authenticated");
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAmountChange = (e) => {
    let value = parseFloat(e.target.value) || placeholderAmount;
    if (value < 0) value = 0;
    if (value > 1000000) value = 1000000;
    setAmount(value);
  };

  const handleDailyBalanceReset = async (userRef, userDoc) => {
    const userData = userDoc.data();
    const lastUpdated = userData.lastDailyReset;
    const currentDate = new Date();
    const today = currentDate.toISOString().split("T")[0];

    if (!lastUpdated || lastUpdated.split("T")[0] !== today) {
      await updateDoc(userRef, {
        dailyBalance: 250,
        lastDailyReset: currentDate.toISOString(),
      });
      console.log("Daily balance reset to 250 for the new day.");
    }
  };

  const handleHelpPercentageChange = (e) => {
    setHelpPercentage(e.target.value);
  };

  const handleUpiIdChange = (e) => {
    setUpiId(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const helpingMoney = (amount * helpPercentage) / 100;
  const total = amount + helpingMoney;

  const handleSubmit = async () => {
    if (!user) {
      alert("User not authenticated");
      return;
    }
  
    const donationRef = doc(db, "donationCollections", donationId);
    const donationDoc = await getDoc(donationRef);
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
  
    if (!donationDoc.exists()) {
      console.log("Donation document does not exist.");
      alert("Donation not found. Please try again later.");
      return;
    }
  
    if (!userDoc.exists()) {
      console.log("User document does not exist.");
      alert("User not found. Please try again later.");
      return;
    }
  
    const donationData = donationDoc.data();
    const donationGoal = donationData.goal || 0;
    const currentAmount = donationData.amount || 0;
  
    if (amount < 10) {
      alert("Donation amount should be at least ₹10.");
      return;
    } else if (amount > 1000000) {
      alert("Donation amount should not exceed ₹10,00,000.");
      return;
    }
  
    if (currentAmount + amount > donationGoal) {
      alert(`Donation exceeds the goal of ₹${donationGoal}. Please reduce your donation.`);
      return;
    }
  
    const userData = userDoc.data();
    let dailyBalance = userData.dailyBalance || 250;
  
    let coinsToAdd = 0;
    if (dailyBalance > 0) {
      const eligibleForCoins = Math.min(dailyBalance, amount);
      coinsToAdd = Math.floor(eligibleForCoins / 250) * 25;
      dailyBalance -= eligibleForCoins;
    }
  
    const newBalanceHistoryEntry = { date: new Date().toISOString(), balance: userData.balance };
    const newDonation = { name, amount, date: new Date() };
  
    try {
      let currentDonationAmount = 0;
      if (donationDoc.exists()) {
        currentDonationAmount = donationData.amount || 0;
      }
  
      await updateDoc(donationRef, {
        amount: currentDonationAmount + amount,
      });
  
      await addDoc(collection(db, "donationCollections", donationId, "donations"), newDonation);
  
      const newTotalDonations = (userData.totalDonations || 0) + amount;
  
      if (dailyBalance > 0) {
        await updateDoc(userRef, {
          totalDonations: newTotalDonations,
          balance: (userData.balance || 0) + coinsToAdd,
          dailyBalance: dailyBalance,
          balanceHistory: [...(userData.balanceHistory || []), newBalanceHistoryEntry],
        });
      } else {
        await updateDoc(userRef, {
          totalDonations: newTotalDonations,
          dailyBalance: dailyBalance,
          balanceHistory: [...(userData.balanceHistory || []), newBalanceHistoryEntry],
        });
      }
  
      alert("Thank You For Your Valuable Donation!");
      router.back();
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
              <span>Contribution Share for SustainEarth</span>
              <input
                type="range"
                className="input_field"
                min={0}
                max={100}
                value={helpPercentage}
                onChange={handleHelpPercentageChange}
              />
              <span>{helpPercentage}%</span>
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
                  <span>Actual Donation:</span>
                  <span>₹{amount.toFixed(2)}</span>
                  <span>Helping Money ({helpPercentage}%):</span>
                  <span>₹{helpingMoney.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card checkout">
          <div className="footer">
            <label className="price">Total: ₹{total.toFixed(2)}</label>
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
  
  .donation-percentage {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #333;
  }
  
  .slider {
    width: 100%;
  }
    
`;

export default Form;
