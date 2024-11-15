"use client";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import image1 from "../../../public/images/f1.jpg";

const articles = [
  {
    title: "How to Master Time Management in School",
    description:
      "Time management is essential for balancing your studies, extracurricular activities, and personal life. This article will guide you through practical steps like prioritizing tasks, setting goals, and creating a study schedule. These strategies will help you stay on top of your responsibilities without feeling overwhelmed.",
  },
  {
    title: "Top Strategies for Active Learning",
    description:
      "Active learning techniques like taking notes during lessons, self-testing, and engaging in group discussions can dramatically improve retention. Find out how you can apply these methods to your daily routine to absorb knowledge more effectively and avoid last-minute cramming.",
  },
  {
    title: "Exploring the Basics of Algebra: A Student’s Guide",
    description:
      "Algebra might seem intimidating at first, but understanding the foundational concepts can make it easier. This article explains key topics like variables, equations, and functions with step-by-step examples to help students master the subject at their own pace.",
  },
  {
    title: "Real Students Share: How I Improved My Grades in Science",
    description:
      "Get inspired by real-life stories of students who turned their grades around by changing their study habits. Learn about their challenges and the tips that helped them succeed in subjects like biology, chemistry, and physics.",
  },
  {
    title: "Innovative EdTech Tools to Enhance Your Learning Experience",
    description:
      "From digital flashcards to AI-based tutors, technology is reshaping education. Discover the best tools available for students that can help simplify complex concepts, enhance study sessions, and even manage time more efficiently.",
  },
];

const Articles = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in ms
      easing: "ease-in-out", // Easing function
      once: true, // Whether animation should happen only once
    });
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center font-poppins bg-[#f9f6f4] mt-9">
      <div className="w-4/5">
        {articles.map((article, index) => (
          <div
            key={index}
            className={`flex ${
              index % 2 === 0 ? "" : "flex-row-reverse"
            } mb-10 items-center gap-8`}
            data-aos={index % 2 === 0 ? "fade-up" : "fade-down"}
          >
            <div className="w-1/4">
              <Image
                src={image1}
                className="rounded-md"
                alt={`Image for ${article.title}`}
                placeholder="blur"
                layout="responsive"
                width={150}
                height={100}
              />
            </div>
            <div className="w-3/4 flex flex-col">
              <h1 className="text-3xl font-semibold mb-4 text-gray-800">
                {article.title}
              </h1>
              <p className="text-gray-600 leading-relaxed">{article.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Articles;
