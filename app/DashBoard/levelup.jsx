"use client"
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { PlusCircle, X } from 'lucide-react';

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

  const levelThresholds = {
    1: 0,
    2: 750,
    3: 1500,
    4: 3000,
    5: 5000
  };

  const levelColors = {
    1: { bg: 'bg-blue-500', text: 'text-blue-500' },
    2: { bg: 'bg-green-500', text: 'text-green-500' },
    3: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
    4: { bg: 'bg-purple-500', text: 'text-purple-500' },
    5: { bg: 'bg-red-500', text: 'text-red-500' }
  };

  const calculateLevel = (balance) => {
    let level = 1;
    for (let i = 5; i >= 1; i--) {
      if (balance >= levelThresholds[i]) {
        level = i;
        break;
      }
    }
    return level;
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

  const calculateProgress = (balance) => {
    const currentLevel = calculateLevel(balance);
    if (currentLevel === 5) return 100;

    const currentThreshold = levelThresholds[currentLevel];
    const nextThreshold = levelThresholds[currentLevel + 1];
    const progress = ((balance - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateRemaining = (balance) => {
    const currentLevel = calculateLevel(balance);
    if (currentLevel === 5) return 0;
    return levelThresholds[currentLevel + 1] - balance;
  };

  const updateProgressData = (currentFriends) => {
    if (!userData || !userData.balanceHistory) return;

    const userBalanceHistory = processBalanceHistory(userData.balanceHistory);

    const friendsProgressData = currentFriends.map(friend => {
      const friendBalanceHistory = friend.balanceHistory 
        ? processBalanceHistory(friend.balanceHistory)
        : userBalanceHistory.map(entry => ({
            date: entry.date,
            balance: friend.balance || 0
          }));
      
      return friendBalanceHistory;
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

    if (userData && newFriendUsername === userData.username) {
      setFriendError('You cannot add yourself');
      return;
    }

    if (trackedFriends.some(friend => friend.username === newFriendUsername)) {
      setFriendError('This friend is already tracked');
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
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);
  
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
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (userData && trackedFriends.length > 0) {
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
    } else if (userData) {
      const processedUserHistory = processBalanceHistory(userData.balanceHistory || []);
      const initialProgressData = processedUserHistory.map(entry => ({
        date: entry.date,
        [userData.username || 'You']: entry.balance
      }));
      setProgressData(initialProgressData);
    }
  }, [userData, trackedFriends.length]);

  const getFilteredLeaderboard = () => {
    let filtered = leaderboardData;
    if (levelFilter !== 'all') {
      filtered = leaderboardData.filter(user => user.level === parseInt(levelFilter));
    }
    return filtered.sort((a, b) => (b.balance || 0) - (a.balance || 0));
  };

  const currentLevel = calculateLevel(userData?.balance || 0);
  const progressToNext = calculateProgress(userData?.balance || 0);
  const remainingToNext = calculateRemaining(userData?.balance || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Level Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
          <div className={`px-4 py-2 rounded-full font-bold text-white ${levelColors[currentLevel].bg}`}>
            Level {currentLevel}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${levelColors[currentLevel].bg}`}
            style={{ width: `${progressToNext}%` }}
          />
        </div>
        <p className="text-gray-600 text-center">
          ₹{remainingToNext} more to reach Level {currentLevel < 5 ? currentLevel + 1 : 'MAX'}
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
            {getFilteredLeaderboard().map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${index < 3 ? 'text-2xl text-yellow-500' : 'text-gray-600'}`}>
                    #{index + 1}
                  </span>
                  <span className="font-semibold">{user.username}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-white ${levelColors[user.level].bg}`}>
                    Level {user.level}
                  </span>
                  <span className="text-gray-600">₹{user.balance || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Progress Graph Section */}
      {showProgress && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-col gap-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Balance Progress</h2>
            
            {/* Friend Management Section */}
            <div className="flex flex-col gap-4">
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                  type="text"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  placeholder="Enter friend's username"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center gap-2"
                >
                  <PlusCircle size={20} />
                  Add Friend
                </button>
              </form>
              {friendError && (
                <p className="text-red-500 text-sm">{friendError}</p>
              )}
              
              {/* Tracked Friends List */}
              <div className="flex flex-wrap gap-2">
                {trackedFriends.map(friend => (
                  <div 
                    key={friend.id}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span>{friend.username}</span>
                    <button
                      onClick={() => removeFriend(friend.username)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full h-[400px]">
            <ResponsiveContainer>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={userData?.username || 'You'} 
                  stroke="#0d9488" 
                  strokeWidth={2}
                />
                {trackedFriends.map((friend, index) => (
                  <Line 
                    key={friend.id}
                    type="monotone"
                    dataKey={friend.username}
                    stroke={`hsl(${(index * 137) % 360}, 70%, 50%)`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
  
      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center transform transition-all duration-300 scale-95 hover:scale-100">
            <h2 className="text-3xl font-bold mb-4">Level Up!</h2>
            <p className="text-xl mb-4">Congratulations! You've reached a new level!</p>
            <div className={`px-6 py-3 rounded-full font-bold text-white ${levelColors[currentLevel].bg} animate-pulse mx-auto mb-6`}>
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
}

export default ProgressDashboard;
            