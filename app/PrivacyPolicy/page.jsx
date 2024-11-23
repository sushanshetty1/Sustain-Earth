import Link from 'next/link';
import React from 'react';

const PrivacyPolicy = () => {
  const policyCards = [
    {
      icon: "shield-lock",
      title: "Data Protection",
      content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Your data is encrypted and stored securely."
    },
    {
      icon: "collection",
      title: "Information Collection",
      content: "We collect only essential information needed to provide our services, including personal details, usage data, and technical information about your device and browsing patterns."
    },
    {
      icon: "gear",
      title: "How We Use Data",
      items: [
        "Service improvement",
        "Communication",
        "Analytics",
        "Legal compliance"
      ]
    },
    {
      icon: "person-check",
      title: "Your Rights",
      items: [
        "Access your data",
        "Request corrections",
        "Data portability",
        "Withdraw consent"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br mt-14 from-[#f6f8fd] to-white">
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <div className="h-[3px] w-[60px] bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto my-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Policy Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {policyCards.map((card, index) => (
            <div 
              key={card.title}
              className="bg-white p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <i className={`bi bi-${card.icon} text-4xl text-indigo-600`}></i>
                <h2 className="text-2xl font-bold text-gray-800 ml-4">{card.title}</h2>
              </div>
              
              {card.content ? (
                <p className="text-gray-600 leading-relaxed">{card.content}</p>
              ) : (
                <ul className="text-gray-600 space-y-3">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-center">
                      <i className={`bi bi-${index === 2 ? 'check2-circle text-green-500' : 'arrow-right-circle text-indigo-500'} mr-2`}></i>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Questions about our policy?</h2>
              <p className="text-gray-600">We're here to help with any privacy-related concerns.</p>
            </div>
            
            <div className="flex space-x-4">
              {/* Fixed the nested anchor tags issue */}
              <Link 
                href="/Contact" 
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <i className="bi bi-envelope-fill mr-2"></i>
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>Last updated: November 2024 | <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">Terms of Service</Link></p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;