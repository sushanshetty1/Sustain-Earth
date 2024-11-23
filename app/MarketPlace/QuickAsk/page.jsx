"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, ThumbsUp, RefreshCw, MapPin, MessageSquare, Clock, Tag, Trash2, Loader2 } from 'lucide-react';
import { db, getDocs, addDoc, updateDoc, doc, query, where } from '../../../firebaseConfig';
import { onSnapshot, collection, orderBy, serverTimestamp, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { useGeolocation, calculateDistance, formatDistance, saveRequestWithLocation } from '@/components/Location';
import Loader from './loader';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageUnsubscribes, setMessageUnsubscribes] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRequest, setCurrentRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    acceptRequest: {},
    deleteRequest: {},
    submitRequest: false
  });
  
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

  const canDeleteRequest = (request) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    if (!request) return false;
    
    return (
      userRole === 'Admin' || 
      request.userId === currentUser.uid
    );
  };

  const handleDeleteRequest = async (requestId) => {
    if (!auth.currentUser) {
      setError('You must be logged in to delete requests');
      return;
    }

    setLoadingStates(prev => ({
      ...prev,
      deleteRequest: { ...prev.deleteRequest, [requestId]: true }
    }));

    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        setError('Request not found');
        return;
      }

      const requestData = { ...requestSnap.data(), id: requestId };
      
      if (!canDeleteRequest(requestData)) {
        setError('You do not have permission to delete this request');
        return;
      }

      const messagesRef = collection(db, 'requests', requestId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const batch = writeBatch(db);
      
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      batch.delete(requestRef);
      await batch.commit();

      setRequests(prev => ({
        pending: prev.pending.filter(r => r.id !== requestId),
        accepted: prev.accepted.filter(r => r.id !== requestId),
        myRequests: prev.myRequests.filter(r => r.id !== requestId)
      }));

      if (currentRequest?.id === requestId) {
        setIsChatOpen(false);
        setCurrentRequest(null);
      }
      
      if (messageUnsubscribes[requestId]) {
        messageUnsubscribes[requestId]();
        setMessageUnsubscribes(prev => {
          const newUnsubscribes = { ...prev };
          delete newUnsubscribes[requestId];
          return newUnsubscribes;
        });
      }

      setError(null);
    } catch (error) {
      console.error('Error deleting request:', error);
      setError(
        error.code === 'permission-denied' 
          ? 'You do not have permission to delete this request'
          : 'Failed to delete request. Please try again.'
      );
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        deleteRequest: { ...prev.deleteRequest, [requestId]: false }
      }));
    }
  };



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
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchUserLocationAndRequests = async () => {
      setIsLoading(true);
      try {
        const userLocation = await getUserLocation();
        const auth = getAuth();
        
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

            const currentUser = auth.currentUser;
            
            const searchFilteredRequests = requestsData.filter(req => {
              const searchLower = searchQuery.toLowerCase();
              return (
                req.title?.toLowerCase().includes(searchLower) ||
                req.description?.toLowerCase().includes(searchLower) ||
                req.category?.toLowerCase().includes(searchLower)
              );
            });

            const filteredRequests = {
              pending: searchFilteredRequests.filter(req => 
                req.status === 'pending' && 
                (!currentUser || req.userId !== currentUser.uid)
              ),
              accepted: searchFilteredRequests.filter(req => 
                req.status === 'accepted' && 
                (req.acceptedBy === currentUser?.uid || req.userId === currentUser?.uid)
              ),
              myRequests: searchFilteredRequests.filter(req => 
                req.userId === currentUser?.uid
              )
            };
            
            setRequests(filteredRequests);
            setIsLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Location or requests fetch error:', error);
        setError('Failed to fetch requests. Please check your connection.');
        setIsLoading(false);
      }
    };
    
    const cleanup = fetchUserLocationAndRequests();
    return () => {
      cleanup.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [currentTab, fetchRequestMessages, auth.currentUser?.uid, searchQuery]);

  const handleAcceptRequest = async (id) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        setError('You must be logged in to accept requests');
        return;
      }

      setLoadingStates(prev => ({
        ...prev,
        acceptRequest: { ...prev.acceptRequest, [id]: true }
      }));
  
      const requestRef = doc(db, 'requests', id);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        setError('Request not found');
        return;
      }
  
      const requestData = { ...requestSnap.data(), id };
  
      if (requestData.status !== 'pending') {
        setError('This request has already been accepted');
        return;
      }
  
      if (requestData.userId === auth.currentUser.uid) {
        setError('You cannot accept your own request');
        return;
      }
  
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedBy: auth.currentUser.uid,
        acceptedAt: serverTimestamp()
      });
  
      const messagesRef = collection(requestRef, 'messages');
      await addDoc(messagesRef, {
        text: 'Request accepted! You can now chat with each other.',
        timestamp: serverTimestamp(),
        system: true,
        sender: 'system'
      });
  
      setRequests(prev => {
        const updatedRequest = {
          ...requestData,
          status: 'accepted',
          acceptedBy: auth.currentUser.uid,
          acceptedAt: new Date()
        };
        
        return {
          pending: prev.pending.filter(r => r.id !== id),
          accepted: [...prev.accepted, updatedRequest],
          myRequests: prev.myRequests
        };
      });
  
      const unsubscribe = await fetchRequestMessages(id);
      setMessageUnsubscribes(prev => ({
        ...prev,
        [id]: unsubscribe
      }));
  
      setError(null);
    } catch (error) {
      console.error('Error accepting request:', error);
      setError(
        error.code === 'permission-denied' 
          ? 'You do not have permission to accept this request.'
          : 'Failed to accept request. Please try again.'
      );
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        acceptRequest: { ...prev.acceptRequest, [id]: false }
      }));
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
  
    setLoadingStates(prev => ({ ...prev, submitRequest: true }));

    try {
      const formData = new FormData(e.target);
      const requestData = {
        title: formData.get('itemName'),
        category: formData.get('category'),
        description: formData.get('description'),
        duration: formData.get('duration'),
        status: 'pending',
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };
  
      let locationData = await getUserLocation();
      if (locationData) {
        requestData.location = locationData;
      }
  
      const docRef = await addDoc(collection(db, 'requests'), requestData);
      
      // Don't update local state - let the snapshot listener handle it
      setIsModalOpen(false);
      setError(null);
      e.target.reset();
  
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.code === 'permission-denied' 
        ? 'You do not have permission to create a request.'
        : 'Failed to submit request. Please try again.'
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, submitRequest: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentRequest || !auth.currentUser) return;

    try {
      const messageData = {
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        sender: auth.currentUser.uid,
      };

      const messagesRef = collection(db, 'requests', currentRequest.id, 'messages');
      await addDoc(messagesRef, messageData);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const openChat = async (request) => {
    setCurrentRequest(request);
    setIsChatOpen(true);

    if (messageUnsubscribes[request.id]) {
      messageUnsubscribes[request.id]();
    }

    try {
      const messagesRef = collection(db, 'requests', request.id, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp'));

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));

        setRequestChats(prev => ({
          ...prev,
          [request.id]: messages
        }));
      });

      setMessageUnsubscribes(prev => ({
        ...prev,
        [request.id]: unsubscribe
      }));
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      setError('Failed to load chat messages');
    }
  };

    useEffect(() => {
      return () => {
        Object.values(messageUnsubscribes).forEach(unsubscribe => unsubscribe?.());
      };
    }, [messageUnsubscribes]);
  
    const renderMessages = (requestId) => {
      const messages = requestChats[requestId] || [];
      
      const sortedMessages = [...messages].sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp?.seconds * 1000);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp?.seconds * 1000);
        return timeA - timeB;
      });
    
      return sortedMessages.map((message, index) => (
        <div 
          key={message.id || index}
          className={`mb-3 ${
            message.sender === auth.currentUser?.uid 
              ? 'text-right' 
              : message.system 
                ? 'text-center italic' 
                : 'text-left'
          }`}
        >
          <div
            className={`inline-block px-4 py-2 rounded-lg ${
              message.system 
                ? 'bg-gray-100 text-gray-600' 
                : message.sender === auth.currentUser?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {message.timestamp instanceof Date 
              ? message.timestamp.toLocaleString()
              : new Date(message.timestamp?.seconds * 1000).toLocaleString()}
          </p>
        </div>
      ));
    };
    
    const ChatModal = () => {
      const [localMessage, setLocalMessage] = useState('');
      const messagesEndRef = useRef(null);
      const chatContainerRef = useRef(null);
      const [isInitialLoad, setIsInitialLoad] = useState(true);
      
      useEffect(() => {
        // Only scroll to bottom on initial load
        if (isInitialLoad && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView();
          setIsInitialLoad(false);
        }
      }, [requestChats[currentRequest?.id], isInitialLoad]);
    
      // Reset initial load state when opening a new chat
      useEffect(() => {
        if (currentRequest) {
          setIsInitialLoad(true);
        }
      }, [currentRequest?.id]);
    
      const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleLocalSendMessage();
        }
      };
    
      const handleLocalSendMessage = async () => {
        if (!localMessage.trim() || !currentRequest || !auth.currentUser) return;
    
        try {
          const messageData = {
            text: localMessage.trim(),
            timestamp: serverTimestamp(),
            sender: auth.currentUser.uid,
          };
    
          const messagesRef = collection(db, 'requests', currentRequest.id, 'messages');
          await addDoc(messagesRef, messageData);
          setLocalMessage('');
        } catch (error) {
          console.error('Error sending message:', error);
          setError('Failed to send message. Please try again.');
        }
      };
    
      return isChatOpen && currentRequest && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96 max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              Chat about {currentRequest.title}
            </h2>
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 min-h-[300px] p-4 bg-gray-50 rounded-lg"
            >
              {renderMessages(currentRequest.id)}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={localMessage}
                onChange={(e) => setLocalMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                placeholder="Type a message..."
              />
              <button
                onClick={handleLocalSendMessage}
                className="bg-blue-500 text-white rounded-lg px-4 hover:bg-blue-600"
              >
                Send
              </button>
            </div>
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => {
                setIsChatOpen(false);
                messageUnsubscribes[currentRequest.id]?.();
              }}
            >
              Close Chat
            </button>
          </div>
        </div>
      );
    };

    const LoadingSpinner = () => (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {isLoading && <LoadingSpinner />}
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {request.distance || 'Distance not available'}
              </span>
            </div>
          </div>
  
          {/* Rest of the card content remains the same */}
          <p className="text-sm text-gray-600 mb-4">{request.description}</p>
  
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
              <Tag className="h-3 w-3" /> {request.category}
            </span>
            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
              <Clock className="h-3 w-3" /> {request.duration}
            </span>
          </div>
  
          {currentTab === 'pending' && request.userId !== auth.currentUser?.uid ? (
                <button
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600 disabled:bg-blue-300"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={loadingStates.acceptRequest[request.id]}
                >
                  {loadingStates.acceptRequest[request.id] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="mr-2 h-4 w-4" />
                  )}
                  {loadingStates.acceptRequest[request.id] ? 'Accepting...' : 'Accept'}
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

              {canDeleteRequest(request) && (
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg w-full hover:bg-red-600 disabled:bg-red-300"
                  disabled={loadingStates.deleteRequest[request.id]}
                >
                  {loadingStates.deleteRequest[request.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {loadingStates.deleteRequest[request.id] ? 'Deleting...' : 'Delete'}
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
                className="w-full py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:bg-blue-300"
                disabled={loadingStates.submitRequest}
              >
                {loadingStates.submitRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
            <button
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg"
              onClick={() => setIsModalOpen(false)}
              disabled={loadingStates.submitRequest}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ChatModal />
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