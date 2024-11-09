import React from "react";

const Sidebar = () => {
  return (
    <div className="w-1/5 bg-gray-100 p-4">
      <ul className="space-y-4">
        <li>
          <button className="text-gray-700 font-semibold w-full text-left">Add Items</button>
        </li>
        <li>
          <button className="text-gray-700 font-semibold w-full text-left">List Items</button>
        </li>
        <li>
          <button className="text-gray-700 font-semibold w-full text-left rounded">Orders</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
