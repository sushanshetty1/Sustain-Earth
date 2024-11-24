import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const revenueRef = collection(db, 'revenueCollections');
        const q = query(
          revenueRef,
          where('date', '>=', Timestamp.fromDate(twentyFourHoursAgo))
        );
        
        const querySnapshot = await getDocs(q);
        const hourlyData = {};

        for (let i = 0; i < 24; i++) {
          const hourDate = new Date(now.getTime() - (i * 60 * 60 * 1000));
          const hourKey = hourDate.toISOString().slice(0, 13);
          hourlyData[hourKey] = {
            hour: hourDate.getHours(),
            time: hourDate.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }),
            platform_contribution: 0,
            premium_subscription: 0,
            total: 0
          };
        }

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.date.seconds * 1000);
          const hourKey = date.toISOString().slice(0, 13);

          if (hourlyData[hourKey]) {
            if (data.type === 'platform_contribution') {
              hourlyData[hourKey].platform_contribution += data.amount;
            } else if (data.type === 'premium_subscription') {
              hourlyData[hourKey].premium_subscription += data.amount;
            }
            
            hourlyData[hourKey].total = 
              hourlyData[hourKey].platform_contribution + 
              hourlyData[hourKey].premium_subscription;
          }
        });

        const processedData = Object.values(hourlyData)
          .sort((a, b) => a.hour - b.hour);

        setRevenueData(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data');
        setLoading(false);
      }
    };

    fetchRevenueData();
    
    const refreshInterval = setInterval(fetchRevenueData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'platform_contribution' ? 'Platform Contribution: ' : 
               entry.name === 'premium_subscription' ? 'Premium Subscription: ' : 
               'Total: '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading revenue data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const totalRevenue = revenueData.reduce((sum, hour) => sum + hour.total, 0);
  const platformTotal = revenueData.reduce((sum, hour) => sum + hour.platform_contribution, 0);
  const subscriptionTotal = revenueData.reduce((sum, hour) => sum + hour.premium_subscription, 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl text-white font-bold">24-Hour Revenue Dashboard</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-white font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Platform Contributions</p>
            <p className="text-purple-400 font-bold">{formatCurrency(platformTotal)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Premium Subscriptions</p>
            <p className="text-green-400 font-bold">{formatCurrency(subscriptionTotal)}</p>
          </div>
        </div>
      </div>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="time"
              stroke="#666"
              tick={{ fill: '#666' }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="platform_contribution"
              name="Platform Contribution"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="premium_subscription"
              name="Premium Subscription"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Revenue"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;