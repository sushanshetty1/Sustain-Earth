import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
// import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseApp } from '../../firebaseConfig';

const db = getFirestore(firebaseApp);

const SubscriptionBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWeekDates = () => {
      const now = new Date();
      const currentDay = now.getDay();
      
      const monday = new Date(now);
      monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      return { 
        monday: monday.toISOString(),
        sunday: sunday.toISOString()
      };
    };

    const processFirebaseData = (revenueCollections) => {
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dailyData = new Map(daysOfWeek.map(day => [day, 0]));

      revenueCollections.forEach(doc => {
        if (doc.type === "premium_subscription" && doc.date) {
          // Handle both Date object and Firestore timestamp
          const date = doc.date.toDate ? doc.date.toDate() : new Date(doc.date);
          const dayName = date.toLocaleString('en-US', { weekday: 'short' }).slice(0, 3);
          dailyData.set(dayName, dailyData.get(dayName) + 1);
        }
      });

      return daysOfWeek.map(day => ({
        day,
        subscriptions: dailyData.get(day)
      }));
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { monday, sunday } = getWeekDates();
        
        const revenueCollectionRef = collection(db, "revenueCollections");
        const q = query(
          revenueCollectionRef,
          where("date", ">=", new Date(monday)),
          where("date", "<=", new Date(sunday))
        );
        
        const querySnapshot = await getDocs(q);
        
        const documents = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // If date is a Firestore timestamp, convert it
          if (data.date && data.date.toDate) {
            data.date = data.date.toDate();
          }
          return {
            ...data,
            id: doc.id
          };
        });

        const processedData = processFirebaseData(documents);
        setData(processedData);
        
      } catch (err) {
        setError("Failed to fetch subscription data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 font-medium">
            {label}: {payload[0].value.toLocaleString()} subscriptions
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-2xl">
        <div className="h-96 flex items-center justify-center">
          <div className="text-white">Loading subscription data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-2xl">
        <div className="h-96 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  const totalWeeklySubscriptions = data.reduce((sum, day) => sum + day.subscriptions, 0);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl text-white font-bold">Weekly Premium Subscriptions</h2>
        <p className="text-gray-400 mt-2">
          ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
        </p>
        <p className="text-gray-400">
          Total this week: {totalWeeklySubscriptions} subscriptions
        </p>
        {data.length === 0 && (
          <p className="text-gray-400 mt-2">No subscription data available for this week</p>
        )}
      </div>
      {data.length > 0 && (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#333" 
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#888"
                tick={{ fill: '#888' }}
                axisLine={{ stroke: '#333' }}
              />
              <YAxis
                stroke="#888"
                tick={{ fill: '#888' }}
                axisLine={{ stroke: '#333' }}
                tickFormatter={(value) => value}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar
                dataKey="subscriptions"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                barSize={40}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SubscriptionBarChart;