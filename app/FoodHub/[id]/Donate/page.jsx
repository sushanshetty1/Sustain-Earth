"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import styled from "styled-components";
import { db } from "../../../../firebaseConfig";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loader from "../loader";

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
      return 250;
    }
    return userData.dailyBalance || 0;
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

  const saveToRevenueCollections = async (helpingMoney) => {
    try {
      await addDoc(collection(db, "revenueCollections"), {
        amount: helpingMoney,
        date: new Date(),
        paymentStatus: "completed",
        type: "platform_contribution",
        userId: user.uid,
        username: name,
        donationId: donationId
      });
      console.log("Revenue collection saved successfully");
    } catch (error) {
      console.error("Error saving revenue collection: ", error);
      throw error;
    }
  };

  const calculateCoinsAndBalance = (currentDailyBalance, donationAmount) => {
    const donationSegments = Math.floor(donationAmount / 250);
    
    const potentialCoins = donationSegments * 25;
    
    const coinsToAdd = Math.min(potentialCoins, currentDailyBalance);
    
    const newDailyBalance = currentDailyBalance - coinsToAdd;
    
    console.log('Calculation details:', {
      currentDailyBalance,
      donationAmount,
      donationSegments,
      potentialCoins,
      actualCoinsGiven: coinsToAdd,
      newDailyBalance,
      explanation: '25 coins per 250 Rs donated, limited by daily balance'
    });
    
    return {
      coinsToAdd,
      newDailyBalance
    };
  };

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
    const userData = userDoc.data();
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

    try {
      const currentDailyBalance = await handleDailyBalanceReset(userRef, userDoc);
      
      console.log('Before calculation:', {
        currentDailyBalance,
        donationAmount: amount
      });

      const { coinsToAdd, newDailyBalance } = calculateCoinsAndBalance(currentDailyBalance, amount);
      
      console.log('After calculation:', {
        currentBalance: userData.balance,
        coinsToAdd,
        newDailyBalance
      });

      const newBalanceHistoryEntry = {
        date: new Date().toISOString(),
        previousBalance: userData.balance || 0,
        coinsAdded: coinsToAdd,
        balance: (userData.balance || 0) + coinsToAdd,
        type: 'donation_reward',
        donationAmount: amount
      };

      const newDonation = {
        name,
        amount,
        date: new Date(),
        coinsEarned: coinsToAdd,
        dailyBalanceRemaining: newDailyBalance
      };

      await updateDoc(donationRef, {
        amount: currentAmount + amount,
      });
  
      await addDoc(collection(db, "donationCollections", donationId, "donations"), newDonation);
  
      await saveToRevenueCollections(helpingMoney);
  
      const updatedUserData = {
        totalDonations: (userData.totalDonations || 0) + amount,
        dailyBalance: newDailyBalance,
        balance: (userData.balance || 0) + coinsToAdd,
        balanceHistory: [...(userData.balanceHistory || []), newBalanceHistoryEntry],
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(userRef, updatedUserData);
      
      console.log('Final update:', {
        previousBalance: userData.balance || 0,
        coinsAdded: coinsToAdd,
        newBalance: (userData.balance || 0) + coinsToAdd,
        newDailyBalance
      });
  
      let message = `Thank You For Your Valuable Donation!`;
      if (coinsToAdd > 0) {
        message += `\nYou earned ${coinsToAdd} coins from your remaining daily balance of ₹${currentDailyBalance}!`;
        message += `\nDaily balance used completely for today.`;
      }
      alert(message);
      router.back();
    } catch (error) {
      console.error("Error processing donation: ", error);
      alert("Failed to process donation. Please try again.");
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
