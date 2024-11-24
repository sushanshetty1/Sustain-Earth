import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const SubscriptionBarChart = () => {
  const data = [
    { month: 'Jan', subscriptions: 1200 },
    { month: 'Feb', subscriptions: 1500 },
    { month: 'Mar', subscriptions: 2200 },
    { month: 'Apr', subscriptions: 2800 },
    { month: 'May', subscriptions: 3400 },
    { month: 'Jun', subscriptions: 4100 },
    { month: 'Jul', subscriptions: 4800 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 font-medium">
            {`${label}: ${payload[0].value.toLocaleString()} subscribers`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black rounded-xl shadow-2xl">
        <div className="mb-6">
        <h2 className="text-2xl text-white font-bold ">Subscriptions </h2>
      </div>
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
              dataKey="month"
              stroke="#888"
              tick={{ fill: '#888' }}
              axisLine={{ stroke: '#333' }}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: '#888' }}
              axisLine={{ stroke: '#333' }}
              tickFormatter={(value) => `${value}`}
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
    </div>
  );
};

export default SubscriptionBarChart;