"use client";
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ThumbsUp, RefreshCw, MapPin, MessageSquare, Clock, Tag } from 'lucide-react';
import { db, getDocs, addDoc, updateDoc, doc, query, where } from '../../../firebaseConfig';
import { onSnapshot, collection, orderBy } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { useGeolocation, calculateDistance, formatDistance, saveRequestWithLocation } from '@/components/Location';

const initialMockRequests = {
  pending: [],
  accepted: [],
  myRequests: []
};

export default function App() {
  const { location, error: locationError } = useGeolocation();
  const [currentTab, setCurrentTab] = useState('pending');
  const [requests, setRequests] = useState(initialMockRequests);
  const [requestChats, setRequestChats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRequest, setCurrentRequest] = useState(null);
  const [error, setError] = useState(null);
  const openRequestsCount = requests.pending.length;
  const acceptedRequestsCount = requests.accepted.length;
  const auth = getAuth();

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            console.warn('Location retrieval failed:', error);
            resolve(null);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 
          }
        );
      } else {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
      }
    });
  };



// In your request fetching logic


  const fetchRequestMessages = useCallback(async (requestId) => {
    try {
      const messagesRef = collection(db, 'requests', requestId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp'));

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRequestChats(prev => ({
          ...prev,
          [requestId]: messages
        }));
      });

      if (location && requestData.location) {
        requestData.distance = formatDistance(
          calculateDistance(
            location.latitude, 
            location.longitude,
            requestData.location.latitude, 
            requestData.location.longitude
          )
        );
      }

      return unsubscribe;
    } catch (error) {
      console.error(`Error fetching messages for request ${requestId}:`, error);
      return () => {};
    }
  }, []);

useEffect(() => {
  const fetchUserLocationAndRequests = async () => {
    try {
      const userLocation = await getUserLocation();
      
      const unsubscribe = onSnapshot(
        collection(db, 'requests'), 
        async (snapshot) => {
          const requestsData = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const requestData = { 
                id: docSnap.id, 
                ...docSnap.data() 
              };
  
              if (userLocation && requestData.location) {
                const distanceValue = calculateDistance(
                  userLocation.latitude, 
                  userLocation.longitude,
                  requestData.location.latitude, 
                  requestData.location.longitude
                );
                
                requestData.distance = distanceValue < 1 
                  ? `${Math.round(distanceValue * 1000)} m` 
                  : `${distanceValue.toFixed(1)} km`;
              } else {
                requestData.distance = 'Distance not available';
              }
  
              return requestData;
            })
          );
  
          const filteredRequests = {
            pending: requestsData.filter(req => req.status === 'pending'),
            accepted: requestsData.filter(req => req.status === 'accepted'),
            myRequests: requestsData.filter(req => req.userId === auth.currentUser?.uid)
          };
          
          setRequests(filteredRequests);
        }
      );
  
      return unsubscribe;
    } catch (error) {
      console.error('Location or requests fetch error:', error);
    }
  };
  
  const cleanup = fetchUserLocationAndRequests();
  return () => {
    cleanup.then(unsubscribe => unsubscribe && unsubscribe());
  };
  }, [currentTab, fetchRequestMessages, auth.currentUser?.uid]);

  const handleAcceptRequest = async (id) => {
    try {
      const request = requests.pending.find(r => r.id === id);
      if (request) {
        await updateDoc(doc(db, 'requests', id), { status: 'accepted' });

        setRequests(prev => ({
          ...prev,
          pending: prev.pending.filter(r => r.id !== id),
          accepted: [...prev.accepted, request]
        }));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Failed to accept request. Please try again.');
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      const requestsCollection = collection(db, 'requests');
      const q = query(requestsCollection, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      
      const pendingRequests = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      setRequests(prev => ({
        ...prev,
        pending: pendingRequests
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error refreshing requests:', error);
      setError('Failed to refresh requests. Check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('You must be logged in to create a request');
      return;
    }
  
    try {
      const formData = new FormData(e.target);
      const itemName = formData.get('itemName');
      const category = formData.get('category');
      const description = formData.get('description');
      const duration = formData.get('duration');
  
      const requestData = {
        title: itemName,
        category,
        description,
        duration,
        status: 'pending',
        userId: currentUser.uid
      };
  
      let locationData = null;
      try {
        locationData = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => {
              console.warn('Location not available:', error);
              resolve(null);
            },
            { 
              enableHighAccuracy: true, 
              timeout: 5000, 
              maximumAge: 0 
            }
          );
        });
  
        if (locationData) {
          requestData.location = {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          };
        }
      } catch (locationError) {
        console.warn('Location retrieval failed:', locationError);
      }
  
      const docRef = await addDoc(collection(db, 'requests'), requestData);
  
      setRequests(prev => ({
        ...prev,
        myRequests: [...prev.myRequests, { 
          id: docRef.id, 
          ...requestData 
        }]
      }));
  
      setIsModalOpen(false);
      setError(null);
  
    } catch (error) {
      console.error('Error submitting request:', error);
      
      let errorMessage = 'Failed to submit request.';
      if (error.code === 'permission_denied') {
        errorMessage = 'You do not have permission to create a request.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service is currently unavailable. Please try again later.';
      }
  
      setError(errorMessage);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!newMessage.trim() || !currentRequest) return;

      const newMsg = {
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
        sender: auth.currentUser.uid,
      };

      const messagesCollection = collection(db, 'requests', currentRequest.id, 'messages');
      await addDoc(messagesCollection, newMsg);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const openChat = (request) => {
    setCurrentRequest(request);
    setIsChatOpen(true);
  };

  const renderMessages = (requestId) => {
    const messages = requestChats[requestId] || [];
    
    return messages.map((message, index) => (
      <div 
        key={message.id || index}
        className={`mb-3 ${message.sender === auth.currentUser?.uid ? 'text-right' : ''}`}
      >
        <p className="text-sm text-gray-600">{message.text}</p>
        <p className="text-xs text-gray-400">
          {new Date(message.timestamp).toLocaleString()}
        </p>
      </div>
    ));
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 bg-white border rounded-lg border-white">
            <h3 className="text-lg font-semibold">Open Requests</h3>
            <p className="text-3xl font-bold text-blue-600">{openRequestsCount}</p>
            <p className="text-sm text-gray-500">In your area</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 bg-white border rounded-lg border-white">
            <h3 className="text-lg font-semibold">Your Accepts</h3>
            <p className="text-3xl font-bold text-green-600">{acceptedRequestsCount}</p>
            <p className="text-sm text-gray-500">Items helped with</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
  {/* Search Input */}
  <div className="relative w-full md:w-1/2">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      placeholder="Search requests..."
      className="pl-10 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  {/* Buttons */}
  <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        currentTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-white border'
      }`}
      onClick={() => setCurrentTab('pending')}
    >
      <Clock className="h-4 w-4" />
      <span>Pending</span>
    </button>
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        currentTab === 'accepted' ? 'bg-blue-500 text-white' : 'bg-white border'
      }`}
      onClick={() => setCurrentTab('accepted')}
    >
      <ThumbsUp className="h-4 w-4" />
      <span>Accepted</span>
    </button>
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        currentTab === 'myRequests' ? 'bg-blue-500 text-white' : 'bg-white border'
      }`}
      onClick={() => setCurrentTab('myRequests')}
    >
      <span>My Requests</span>
    </button>
    <button
      className={`flex items-center justify-center px-4 py-2 rounded-lg bg-white border`}
      onClick={handleRefresh}
    >
      <RefreshCw
        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
      />
    </button>

    </div>
  </div>


  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests[currentTab].map((request) => (
        <div key={request.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4">
            {/* Title and Distance */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">{request.title}</h3>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {request.distance || 'Distance not available'}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{request.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                <Tag className="h-3 w-3" /> {request.category}
              </span>
              <span className="text-xs px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                <Clock className="h-3 w-3" /> {request.duration}
              </span>
            </div>

            {/* Buttons */}
            {currentTab === 'pending' && request.userId !== auth.currentUser?.uid ? (
              <button
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600"
                onClick={() => handleAcceptRequest(request.id)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Accept
              </button>
            ) : (
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg w-full hover:bg-green-600"
                onClick={() => openChat(request)}
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </button>
            )}
          </div>
        </div>
      ))}
    </div>

      <button
        className="fixed bottom-6 right-6 rounded-full bg-blue-500 text-white p-4 shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Create New Request</h2>
            <form onSubmit={handleSubmitRequest}>
              <input
                name="itemName"
                placeholder="Item Name"
                className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              <select
                name="category"
                className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="Food">Food</option>
                <option value="Water">Water</option>
                <option value="Medicine">Medicine</option>
                <option value="Clothes">Clothes</option>
              </select>
              <textarea
                name="description"
                placeholder="Description"
                className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                name="duration"
                placeholder="Duration"
                className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-lg"
              >
                Submit Request
              </button>
            </form>
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isChatOpen && currentRequest && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Chat about {currentRequest.title}</h2>
            <div className="overflow-y-auto max-h-72 mb-4">
              {renderMessages(currentRequest.id)}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleSendMessage(currentRequest.id)}
                className="bg-blue-500 text-white rounded-lg px-4"
              >
                Send
              </button>
            </div>
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg"
              onClick={() => setIsChatOpen(false)}
            >
              Close Chat
            </button>
          </div>
        </div>
      )}
  </main>
  );
}


function Card({ children }) {
  return (
    <div className="rounded shadow-sm">
      {children}
    </div>
  );
}

function CardContent({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}