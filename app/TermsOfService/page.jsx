"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Sparkles, Shield, Leaf, Mail, FileText, Users } from 'lucide-react';

const TermsOfService = () => {
  const [hoveredSection, setHoveredSection] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const sectionVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.02,
      x: 10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const getIcon = (title) => {
    switch (title.toLowerCase()) {
      case 'introduction':
        return FileText;
      case 'environmental commitment':
        return Leaf;
      case 'user responsibilities':
        return Users;
      case 'content guidelines':
        return Sparkles;
      case 'privacy and data':
        return Shield;
      case 'contact':
        return Mail;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 mt-9">
      <motion.div 
        className="max-w-4xl mx-auto py-16 px-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-12"
          variants={headerVariants}
        >
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            Terms of Service
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Building a sustainable future together
          </motion.p>
        </motion.div>
        
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = getIcon(section.title);
            return (
              <motion.section
                key={section.title}
                variants={sectionVariants}
                onHoverStart={() => setHoveredSection(index)}
                onHoverEnd={() => setHoveredSection(null)}
                className={`
                  relative overflow-hidden rounded-2xl 
                  ${hoveredSection === index 
                    ? 'bg-orange-50' 
                    : 'bg-white'
                  }
                  transform transition-all duration-300
                  hover:shadow-2xl hover:-translate-y-1
                  border border-orange-100
                  p-8
                `}
              >
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20"
                  animate={{
                    scale: hoveredSection === index ? 1.2 : 1,
                    opacity: hoveredSection === index ? 0.3 : 0.2,
                  }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <motion.div
                      className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white mr-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon size={24} />
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {section.title}
                    </h2>
                  </div>

                  <motion.p 
                    className="text-gray-600 mb-4 leading-relaxed"
                    variants={listItemVariants}
                  >
                    {section.content}
                  </motion.p>

                  {section.list && (
                    <motion.ul className="space-y-3 ml-4">
                      {section.list.map((item, i) => (
                        <motion.li
                          key={i}
                          variants={listItemVariants}
                          whileHover="hover"
                          className="flex items-center text-gray-700"
                        >
                          <motion.span 
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mr-3"
                            whileHover={{ scale: 1.5 }}
                          />
                          {item}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              </motion.section>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-12"
          variants={sectionVariants}
        >
          <motion.button
            className="group px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full 
                     hover:from-orange-600 hover:to-orange-700 transform transition-all duration-200 
                     shadow-lg hover:shadow-2xl flex items-center mx-auto space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>Back to Top</span>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowUp size={20} />
            </motion.div>
          </motion.button>
          
          <motion.p 
            className="mt-8 text-sm text-gray-500 italic"
            variants={sectionVariants}
          >
            Last updated: {new Date().toLocaleDateString()}
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

const sections = [
  {
    title: "Introduction",
    content: "Welcome to our sustainable development platform. These Terms of Service govern your use of our platform. By accessing or using our services, you agree to be bound by these terms."
  },
  {
    title: "Environmental Commitment",
    content: "Our platform is dedicated to promoting sustainable development practices and environmental conservation. Users are expected to respect and support these principles while using our services."
  },
  {
    title: "User Responsibilities",
    content: "Users agree to:",
    list: [
      "Provide accurate and truthful information",
      "Support sustainable development goals",
      "Respect intellectual property rights",
      "Maintain account confidentiality"
    ]
  },
  {
    title: "Content Guidelines",
    content: "All content must align with sustainable development principles and must not:",
    list: [
      "Promote environmentally harmful practices",
      "Contain misleading information about climate change",
      "Violate environmental protection laws"
    ]
  },
  {
    title: "Privacy and Data",
    content: "We are committed to protecting your privacy and personal data. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your data."
  },
  {
    title: "Contact",
    content: "For questions about these terms, please contact:\nEmail: support@sustainabledevelopment.com\nAddress: 123 Green Street, Eco City, EC 12345"
  }
];

export default TermsOfService;