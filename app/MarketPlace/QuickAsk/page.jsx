"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, ThumbsUp, RefreshCw, MapPin, MessageSquare , Clock, Tag} from 'lucide-react';
import { db, getDocs, addDoc, updateDoc, doc, query, where } from '../../../firebaseConfig';
import {onSnapshot, collection} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const initialMockRequests = {
  pending: [],
  accepted: [],
  myRequests: []
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('pending');
  const [requests, setRequests] = useState(initialMockRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRequest, setCurrentRequest] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const requestsData = [];
      snapshot.forEach(doc => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });

      const filteredRequests = requestsData.filter(req => req.status === currentTab);
      setRequests(prev => ({
        ...prev,
        [currentTab]: filteredRequests
      }));
    });
  
    return () => unsubscribe();
  }, [currentTab]);
  

  const handleAcceptRequest = async (id) => {
    const request = requests.pending.find(r => r.id === id);
    if (request) {
      await updateDoc(doc(db, 'requests', id), { status: 'accepted' });

      setRequests(prev => ({
        ...prev,
        pending: prev.pending.filter(r => r.id !== id),
        accepted: [...prev.accepted, request]
      }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Refetch data from Firebase
    const requestsCollection = collection(db, 'requests');
    const q = query(requestsCollection, where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const pendingRequests = [];
    querySnapshot.forEach(doc => {
      pendingRequests.push({ id: doc.id, ...doc.data() });
    });
    
    setRequests(prev => ({
      ...prev,
      pending: pendingRequests
    }));
  
    setIsRefreshing(false);
  };
  

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newRequest = {
      title: formData.get('itemName'),
      category: formData.get('category'),
      description: formData.get('description'),
      distance: 'nearby',
      duration: formData.get('duration'),
      status: 'pending',
      userId: auth.currentUser?.uid,
    };

    const docRef = await addDoc(collection(db, 'requests'), newRequest);
    setRequests(prev => ({
      ...prev,
      myRequests: [...prev.myRequests, { id: docRef.id, ...newRequest }]
    }));
    setIsModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const newMsg = {
        text: newMessage,
        timestamp: new Date().toISOString(),
        sender: auth.currentUser?.uid,
        requestId: currentRequest.id
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      await addDoc(collection(db, 'messages'), newMsg);
    }
  };

  const fetchMessages = async (requestId) => {
    const messagesCollection = collection(db, 'messages');
    const q = query(messagesCollection, where("requestId", "==", requestId));
    const querySnapshot = await getDocs(q);
    const fetchedMessages = [];
    querySnapshot.forEach(doc => {
      fetchedMessages.push(doc.data());
    });

    setMessages(fetchedMessages);
  };

  const openChat = (request) => {
    setCurrentRequest(request);
    fetchMessages(request.id);
    setIsChatOpen(true);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Open Requests</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500">In your area</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Your Accepts</h3>
            <p className="text-3xl font-bold text-green-600">5</p>
            <p className="text-sm text-gray-500">Items helped with</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search requests..."
            className="pl-10 w-full px-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-lg ${currentTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setCurrentTab('pending')}
          >
            <Clock className="mr-2 h-4 w-4" /> Pending
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${currentTab === 'accepted' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setCurrentTab('accepted')}
          >
            <ThumbsUp className="mr-2 h-4 w-4" /> Accepted
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${currentTab === 'myRequests' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setCurrentTab('myRequests')}
          >
            My Requests
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests[currentTab].map((request) => (
          <div key={request.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{request.title}</h3>
                <span className="text-sm text-gray-500">
                  <MapPin className="inline h-4 w-4" /> {request.distance}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{request.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  <Tag className="inline h-3 w-3 mr-1" /> {request.category}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  <Clock className="inline h-3 w-3 mr-1" /> {request.duration}
                </span>
              </div>
              {currentTab === 'pending' && request.userId !== auth.currentUser?.uid ? (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={() => handleAcceptRequest(request.id)}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" /> Accept
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  onClick={() => openChat(request)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Chat
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
            <h2 className="text-lg font-semibold mb-4">Chat with {currentRequest.title}</h2>
            <div className="overflow-y-auto max-h-72 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${message.sender === auth.currentUser?.uid ? 'text-right' : ''}`}
                >
                  <p className="text-sm text-gray-600">{message.text}</p>
                  <p className="text-xs text-gray-400">{message.timestamp}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSendMessage}
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
    <div className="border border-gray-300 rounded shadow-sm">
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