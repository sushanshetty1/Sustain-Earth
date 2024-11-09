import React from "react";

const OrderCard = ({ order }) => {
  return (
    <div className="border p-4 rounded-md shadow">
      <h2 className="font-bold text-lg">{order.title}</h2>
      <p>Size: {order.size}</p>
      <p>Quantity: {order.quantity}</p>
      <p>Price: ${order.price}</p>
      <p>Status: {order.status}</p>
      <p>Address: {order.address}</p>
      <p>Date: {order.date}</p>
    </div>
  );
};

export default OrderCard;
