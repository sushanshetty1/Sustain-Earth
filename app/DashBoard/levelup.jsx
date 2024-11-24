"use client"
import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import Image from 'next/image';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { PlusCircle, X, Crown } from 'lucide-react';
import coinIcon from "./coinSVG.svg";

const CoinIcon = () => (
  <Image 
    src={coinIcon}
    alt="Coin"
    width={16}
    height={16}
    className="inline-block"
  />
);

const LEVEL_THRESHOLDS = {
  1: 0,
  2: 750,
  3: 1500,
  4: 3000,
  5: 5000
};

const LEVEL_COLORS = {
  1: { bg: 'bg-blue-500', text: 'text-blue-500' },
  2: { bg: 'bg-green-500', text: 'text-green-500' },
  3: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
  4: { bg: 'bg-purple-500', text: 'text-purple-500' },
  5: { bg: 'bg-red-500', text: 'text-red-500' }
};

const calculateLevel = (balance) => {
  let level = 1;
  for (let i = 5; i >= 1; i--) {
    if (balance >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};

const calculateProgress = (balance) => {
  const currentLevel = calculateLevel(balance);
  if (currentLevel === 5) return 100;

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel + 1];
  const progress = ((balance - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

const calculateRemaining = (balance) => {
  const currentLevel = calculateLevel(balance);
  if (currentLevel === 5) return 0;
  return LEVEL_THRESHOLDS[currentLevel + 1] - balance;
};

const processBalanceHistory = (balanceHistory) => {
  const sortedHistory = balanceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  const lastWeek = sortedHistory.slice(-7);
  
  if (lastWeek.length < 7) {
    const today = new Date();
    const missingDays = 7 - lastWeek.length;
    
    for (let i = 1; i <= missingDays; i++) {
      const missingDate = new Date(today);
      missingDate.setDate(today.getDate() - (7 - i));
      
      lastWeek.unshift({
        date: missingDate.toISOString().split('T')[0],
        balance: lastWeek.length > 0 ? lastWeek[0].balance : 0
      });
    }
  }
  
  return lastWeek;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span><CoinIcon />{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomizedDot = ({ cx, cy, payload, value }) => (
  <circle 
    cx={cx} 
    cy={cy} 
    r={4}
    fill="white"
    stroke={value === payload.maxValue ? "#0d9488" : "#6366f1"}
    strokeWidth={2}
  />
);

const ProgressChart = ({ progressData, userData, trackedFriends }) => {
  const gradientOffset = useMemo(() => {
    if (!progressData.length) return 0;
    const dataMax = Math.max(...progressData.map((item) => item[userData?.username || 'You']));
    const dataMin = Math.min(...progressData.map((item) => item[userData?.username || 'You']));
    
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  }, [progressData, userData?.username]);

  return (
    <div className="w-full h-[400px] p-4">
      <ResponsiveContainer>
        <ComposedChart data={progressData}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={gradientOffset} stopColor="#0d9488" stopOpacity={0.3}/>
              <stop offset={gradientOffset} stopColor="#ff4444" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280' }}
            tickLine={{ stroke: '#6b7280' }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280' }}
            tickLine={{ stroke: '#6b7280' }}
            axisLine={{ stroke: '#6b7280' }}
            tickFormatter={(value) => `<CoinIcon/>${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            height={36}
            wrapperStyle={{
              paddingBottom: '20px',
              fontWeight: 500
            }}
          />
          <Area
            type="monotone"
            dataKey={userData?.username || 'You'}
            fill="url(#colorBalance)"
            stroke="none"
          />
          <Line 
            type="monotone"
            dataKey={userData?.username || 'You'}
            stroke="#0d9488"
            strokeWidth={3}
            dot={<CustomizedDot />}
            activeDot={{ r: 6, fill: "#0d9488" }}
          />
          {trackedFriends.map((friend, index) => (
            <Line
              key={friend.id}
              type="monotone"
              dataKey={friend.username}
              stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
              strokeWidth={2}
              dot={<CustomizedDot />}
              activeDot={{ r: 6 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProgressDashboard = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [levelFilter, setLevelFilter] = useState('all');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [friendError, setFriendError] = useState('');
  const [trackedFriends, setTrackedFriends] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  const updateProgressData = (currentFriends) => {
    if (!userData?.balanceHistory) return;

    const userBalanceHistory = processBalanceHistory(userData.balanceHistory);
    const friendsProgressData = currentFriends.map(friend => {
      return friend.balanceHistory 
        ? processBalanceHistory(friend.balanceHistory)
        : userBalanceHistory.map(entry => ({
            date: entry.date,
            balance: friend.balance || 0
          }));
    });

    const combinedProgressData = userBalanceHistory.map((entry, index) => {
      const dataPoint = {
        date: entry.date,
        [userData.username || 'You']: entry.balance
      };

      currentFriends.forEach((friend, friendIndex) => {
        dataPoint[friend.username] = friendsProgressData[friendIndex][index].balance;
      });

      return dataPoint;
    });

    setProgressData(combinedProgressData);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setFriendError('');

    if (!newFriendUsername) {
      setFriendError('Please enter a username');
      return;
    }

    if (userData?.username === newFriendUsername) {
      setFriendError('You cannot add yourself');
      return;
    }

    if (trackedFriends.some(friend => friend.username === newFriendUsername)) {
      setFriendError('This friend is already tracked');
      return;
    }

    if (!isPremium && trackedFriends.length >= 1) {
      setFriendError('Upgrade to premium to track more friends!');
      return;
    }

    try {
      const friendQuery = query(collection(db, 'users'), where('username', '==', newFriendUsername));
      const friendSnapshot = await getDocs(friendQuery);

      if (friendSnapshot.empty) {
        setFriendError('User not found');
        return;
      }

      const friendDoc = friendSnapshot.docs[0];
      const friendData = friendDoc.data();

      const newFriend = {
        id: friendDoc.id,
        username: friendData.username,
        balance: friendData.balance || 0,
        balanceHistory: friendData.balanceHistory || []
      };

      const updatedFriends = [...trackedFriends, newFriend];
      setTrackedFriends(updatedFriends);
      updateProgressData(updatedFriends);
      setNewFriendUsername('');
    } catch (error) {
      console.error('Error adding friend:', error);
      setFriendError('An error occurred while adding friend');
    }
  };

  const removeFriend = (friendUsername) => {
    const updatedFriends = trackedFriends.filter(friend => friend.username !== friendUsername);
    setTrackedFriends(updatedFriends);
    updateProgressData(updatedFriends);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setIsPremium(data.premium || false);

          const newLevel = calculateLevel(data.balance || 0);
          const oldLevel = calculateLevel((userData?.balance || 0));
          if (newLevel > oldLevel) {
            setShowLevelUpModal(true);
          }

          const usersSnapshot = await getDocs(collection(db, "users"));
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            level: calculateLevel(doc.data().balance || 0)
          }));
          setLeaderboardData(usersData);

          if (data.balanceHistory) {
            const processedUserHistory = processBalanceHistory(data.balanceHistory);
            const initialProgressData = processedUserHistory.map(entry => ({
              date: entry.date,
              [data.username || 'You']: entry.balance
            }));
            setProgressData(initialProgressData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userData) return;

    if (trackedFriends.length > 0) {
      const fetchFriendsData = async () => {
        try {
          const updatedFriends = await Promise.all(
            trackedFriends.map(async (friend) => {
              const friendRef = doc(db, "users", friend.id);
              const friendSnap = await getDoc(friendRef);
              
              if (friendSnap.exists()) {
                const friendData = friendSnap.data();
                return {
                  ...friend,
                  balance: friendData.balance || 0,
                  balanceHistory: friendData.balanceHistory || []
                };
              }
              return friend;
            })
          );

          setTrackedFriends(updatedFriends);
          updateProgressData(updatedFriends);
        } catch (error) {
          console.error("Error fetching friends data:", error);
        }
      };

      fetchFriendsData();
    } else {
      const processedUserHistory = processBalanceHistory(userData.balanceHistory || []);
      const initialProgressData = processedUserHistory.map(entry => ({
        date: entry.date,
        [userData.username || 'You']: entry.balance
      }));
      setProgressData(initialProgressData);
    }
  }, [userData, trackedFriends.length]);

  const filteredLeaderboard = useMemo(() => {
    let filtered = leaderboardData;
    if (levelFilter !== 'all') {
      filtered = leaderboardData.filter(user => user.level === parseInt(levelFilter));
    }
    return filtered.sort((a, b) => (b.balance || 0) - (a.balance || 0));
  }, [leaderboardData, levelFilter]);

  const currentLevel = calculateLevel(userData?.balance || 0);
  const progressToNext = calculateProgress(userData?.balance || 0);
  const remainingToNext = calculateRemaining(userData?.balance || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Level Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
          <div className={`px-4 py-2 rounded-full font-bold text-white ${LEVEL_COLORS[currentLevel].bg}`}>
            Level {currentLevel}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${LEVEL_COLORS[currentLevel].bg}`}
            style={{ width: `${progressToNext}%` }}
          />
        </div>
        <p className="text-gray-600 text-center flex items-center justify-center gap-1">
        <CoinIcon />
        {remainingToNext.toLocaleString()} more to reach Level {currentLevel < 5 ? currentLevel + 1 : 'MAX'}
      </p>

      </div>

      {/* Control Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button 
          onClick={() => {
            setShowLeaderboard(true);
            setShowProgress(false);
          }}
          className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
        >
          Show Leaderboard
        </button>
        <button 
          onClick={() => {
            setShowProgress(true);
            setShowLeaderboard(false);
          }}
          className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
        >
          Show Progress Graph
        </button>
      </div>

      {/* Friend Tracking Section */}
      {showProgress && (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Track Friends</h3>
          {!isPremium && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Crown className="w-5 h-5" />
              <span className="text-sm">Upgrade to track unlimited friends!</span>
            </div>
          )}
        </div>
        
        {/* Replaced Alert with custom div */}
        {!isPremium && trackedFriends.length >= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
            You've reached the free plan limit. Upgrade to premium to track more friends!
          </div>
        )}

        <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newFriendUsername}
            onChange={(e) => setNewFriendUsername(e.target.value)}
            placeholder="Enter friend's username"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-all duration-300"
            disabled={!isPremium && trackedFriends.length >= 1}
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </form>
        {friendError && (
          <p className="text-red-500 text-sm mb-4">{friendError}</p>
        )}
        {trackedFriends.length > 0 && (
          <div className="space-y-2">
            {trackedFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span>{friend.username}</span>
                <button
                  onClick={() => removeFriend(friend.username)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* Leaderboard Section */}
      {showLeaderboard && (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Levels</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            {filteredLeaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${index < 3 ? 'text-2xl text-yellow-500' : 'text-gray-600'}`}>
                    #{index + 1}
                  </span>
                  <span className="font-semibold">{user.username}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-white ${LEVEL_COLORS[user.level].bg}`}>
                    Level {user.level}
                  </span>
                  <span className="text-gray-600"><CoinIcon/>{(user.balance || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Graph Section */}
      {showProgress && (
        <ProgressChart 
          progressData={progressData}
          userData={userData}
          trackedFriends={trackedFriends}
        />
      )}

      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center transform transition-all duration-300 scale-95 hover:scale-100">
            <h2 className="text-3xl font-bold mb-4">Level Up!</h2>
            <p className="text-xl mb-4">Congratulations! You've reached a new level!</p>
            <div className={`px-6 py-3 rounded-full font-bold text-white ${LEVEL_COLORS[currentLevel].bg} animate-pulse mx-auto mb-6`}>
              Level {currentLevel}
            </div>
            <button 
              onClick={() => setShowLevelUpModal(false)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-300"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;