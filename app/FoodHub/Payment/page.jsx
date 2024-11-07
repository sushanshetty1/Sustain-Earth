"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function PaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(null); 

  useEffect(() => {
    if (router.query && router.query.amount) {
      setAmount(router.query.amount);
    }
  }, [router.query]); 

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [error, setError] = useState('');

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      setError('Please fill in all fields');
      return;
    }

    if (cardNumber.length < 16) {
      setError('Please enter a valid card number');
      return;
    }

    console.log('Processing payment with:', { 
      cardNumber, 
      expiryDate, 
      cvv, 
      nameOnCard, 
      amount: parseFloat(amount) 
    });

    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setNameOnCard('');
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Support Our Cause</h2>

        {amount && (
          <p className="text-gray-600 text-center mb-6">
            Donation Amount: ₹{parseFloat(amount).toFixed(2)} 
          </p>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form className="w-full" onSubmit={handlePaymentSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Name on Card"
              className="border border-gray-300 w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Card Number"
              className="border border-gray-300 w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <input
                type="text"
                placeholder="MM/YY"
                className="border border-gray-300 w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <input
                type="text"
                placeholder="CVV"
                className="border border-gray-300 w-full py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            Donate Now
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500 text-center">
          Thank you for your generosity!
        </p>
      </div>
    </div>
  );
}

export default PaymentPage;