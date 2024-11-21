"use client";
import React, { useState, useEffect } from "react";
import NewsCard from "@/components/NewsCard";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import {firebaseApp} from "../../../firebaseConfig"


const db = getFirestore(firebaseApp);

const Home = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("global");

    const API_KEY = "6966bddec7201509a9716e13ad4b30e4";

    useEffect(() => {
        fetchNews(activeTab);
    }, [activeTab]);

    const fetchNews = async (type) => {
        setLoading(true);
        setError(null);

        const country = type === "indian" ? "in" : "us";
        const cacheDocRef = doc(db, "news", type);

        try {
            const cachedDoc = await getDoc(cacheDocRef);
            if (cachedDoc.exists()) {
                const { articles, lastFetched } = cachedDoc.data();
                const now = Timestamp.now().toMillis();
                const lastFetchTime = lastFetched.toMillis();

                if (now - lastFetchTime < 2 * 60 * 60 * 1000) {
                    setNews(articles);
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch(
                `https://gnews.io/api/v4/search?q=education&country=${country}&token=${API_KEY}&lang=en&limit=9`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch news");
            }

            const data = await response.json();

            await setDoc(cacheDocRef, {
                articles: data.articles,
                lastFetched: Timestamp.now()
            });

            setNews(data.articles);
        } catch (err) {
            setError("Failed to load news. Please try again later.");
            console.error("Error fetching news:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-black mb-8">
                Education News
            </h1>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("global")}
                    className={`px-6 py-2 rounded-full border-2 border-black font-semibold transition-all duration-300 hover:bg-black hover:text-white ${
                        activeTab === "global" && "bg-black text-white"
                    }`}
                >
                    <i className="bi bi-globe me-2"></i>Global News
                </button>
                <button
                    onClick={() => setActiveTab("indian")}
                    className={`px-6 py-2 rounded-full border-2 border-black font-semibold transition-all duration-300 hover:bg-black hover:text-white ${
                        activeTab === "indian" && "bg-black text-white"
                    }`}
                >
                    <i className="bi bi-flag me-2"></i>Indian News
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center my-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    {error}
                </div>
            )}

            {/* News List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article) => (
                    <NewsCard
                        key={article.url}
                        article={article}
                        formatDate={formatDate}
                    />
                ))}
            </div>
        </main>
    );
};

export default Home;
