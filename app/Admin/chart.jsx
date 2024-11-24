"use client";
import React, { useState } from 'react';
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

const AnimatedLineChart = () => {
  // Sample data - replace with your actual data
  const data = [
    { name: 'Jan', sales: 4000, users: 2400 },
    { name: 'Feb', sales: 3000, users: 1398 },
    { name: 'Mar', sales: 2000, users: 9800 },
    { name: 'Apr', sales: 2780, users: 3908 },
    { name: 'May', sales: 1890, users: 4800 },
    { name: 'Jun', sales: 2390, users: 3800 },
    { name: 'Jul', sales: 3490, users: 4300 },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleMouseMove = (data) => {
    if (data && data.activeTooltipIndex) {
      setActiveIndex(data.activeTooltipIndex);
    }
  };

  return (
    <div className="w-full max-w-4xl  mx-auto p-6 bg-black rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl text-white font-bold ">weekly revenue </h2>
      </div>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onMouseMove={handleMouseMove}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              className='text-white'
              dataKey="name"
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              strokeWidth={2}
              
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#82ca9d"
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

export default AnimatedLineChart;