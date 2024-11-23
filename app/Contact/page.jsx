"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    alert(`Thank you for your message, ${formData.name}! We'll get back to you at ${formData.email} soon.`);
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <section className="min-h-screen pt-20 px-4 md:px-8 pb-17 mt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Contact Us</h1>
        <Card className="hover:scale-105 transition-transform duration-200 shadow-lg">
          <div className="p-5">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-label="Your Name"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-label="Your Email"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  aria-label="Your Message"
                />
              </div>

              <button
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                type="submit"
              >
                Send Message
              </button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
