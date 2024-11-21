"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Send, Clock, Tag, MapPin, MessageSquare, ThumbsUp, RefreshCw } from 'lucide-react';
import { db, collection, getDocs, addDoc, updateDoc, doc, query, where } from '../../../firebaseConfig';
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
  const [currentRequest, setCurrentRequest] = useState(null); // Store the current chat request
  const auth = getAuth();

  useEffect(() => {
    const fetchRequests = async () => {
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
    };

    fetchRequests();
  }, []);

  const handleAcceptRequest = async (id) => {
    const request = requests.pending.find(r => r.id === id);
    if (request) {
      // Move the request to the accepted section
      await updateDoc(doc(db, 'requests', id), { status: 'accepted' });
  
      setRequests(prev => ({
        ...prev,
        pending: prev.pending.filter(r => r.id !== id),
        accepted: [...prev.accepted, request]
      }));
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
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

    // Add new request to Firestore
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
            <h2 className="text-xl font-semibold mb-4">Create a Request</h2>
            <form onSubmit={handleSubmitRequest}>
              <input
                type="text"
                name="itemName"
                placeholder="Item Name"
                required
                className="w-full px-4 py-2 mb-4 border rounded-lg"
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                required
                className="w-full px-4 py-2 mb-4 border rounded-lg"
              />
              <textarea
                name="description"
                placeholder="Description"
                required
                className="w-full px-4 py-2 mb-4 border rounded-lg"
              />
              <input
                type="text"
                name="duration"
                placeholder="Duration"
                required
                className="w-full px-4 py-2 mb-4 border rounded-lg"
              />
              <div className="flex justify-between items-center mt-4">
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                  Submit
                </button>
                <button
                  type="button"
                  className="text-gray-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isChatOpen && currentRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Chat with {currentRequest.title}</h2>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="text-sm font-semibold text-gray-700">{msg.sender}</div>
                  <div className="text-sm">{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <textarea
                className="w-full px-4 py-2 mb-4 border rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


function Input({ placeholder, className, value, onChange, name, required }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-3 py-2 ${className}`}
      value={value}
      onChange={onChange}
      name={name}
      required={required}
    />
  );
}

function Button({ children, variant, onClick, className, type }) {
  const variantClasses = {
    secondary: 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: 'border border-gray-300 hover:bg-gray-100'
  };
  return (
    <button
      type={type || 'button'}
      className={`px-4 py-2 rounded ${variantClasses[variant] || ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
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

function Dialog({ open, onOpenChange, children }) {
  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          {children}
        </div>
      </div>
    )
  );
}

function DialogContent({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

function DialogHeader({ children }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

function DialogTitle({ children }) {
  return (
    <h3 className="text-lg font-semibold">{children}</h3>
  );
}

function Select({ name, children }) {
  return (
    <select name={name} className="border border-gray-300 rounded px-3 py-2">
      {children}
    </select>
  );
}

function SelectTrigger({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

function SelectValue({ placeholder }) {
  return (
    <option value="">{placeholder}</option>
  );
}

function SelectContent({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

function SelectItem({ value, children }) {
  return (
    <option value={value}>{children}</option>
  );
}

function Textarea({ name, required }) {
  return (
    <textarea
      name={name}
      className="border border-gray-300 rounded px-3 py-2"
      required={required}
    />
  );
}