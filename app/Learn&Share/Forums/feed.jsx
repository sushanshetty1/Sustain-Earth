"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { useRouter } from 'next/navigation'; 
import { collection, getDoc ,getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, getDoc as getSingleDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import Loader from './loader';

const StyledModal = styled.div`
  .modal {
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .comment-box {
    transform: translateY(-100%);
    transition: transform 0.3s ease-in-out;
    background-color: #ffffff;
  }
  
  .comment-box.show {
    transform: translateY(0);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #88acac;
    border-radius: 3px;
  }
`;

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const postsCollectionRef = collection(db, 'posts');
        let q = showMyPosts && currentUser
          ? query(postsCollectionRef, where("userId", "==", currentUser.uid))
          : postsCollectionRef;

        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [showMyPosts, currentUser]);

  const updateUserBalance = async (views, count, userId) => {
    if (!currentUser || !userId) return;

    const userDocRef = doc(db, "users", userId);
    try {
      const userDoc = await getSingleDoc(userDocRef);
      if (!userDoc.exists()) {
        console.error("Creator's user document not found for ID:", userId);
        return;
      }

      const userData = userDoc.data();
      let dailyBalance = userData.dailyBalance || 0;
      let balance = userData.balance || 0;
      const lastUpdated = userData.lastUpdated || null;
      const currentDate = new Date().toDateString();

      if (!userData.lastUpdated) {
        await updateDoc(userDocRef, {
          lastUpdated: currentDate,
          dailyBalance: 0,
        });
      }

      if (lastUpdated !== currentDate) {
        dailyBalance = 0;
        await updateDoc(userDocRef, {
          dailyBalance: 0,
          lastUpdated: currentDate,
        });
      }

      if ((views % 100 === 0 || count % 25 === 0) && dailyBalance < 250) {
        const increment = Math.min(5, 250 - dailyBalance);
        dailyBalance += increment;
        balance += increment;

        const balanceHistory = userData.balanceHistory || [];
        const newHistoryEntry = {
          balance,
          date: currentDate,
        };
        balanceHistory.push(newHistoryEntry);

        await updateDoc(userDocRef, {
          dailyBalance,
          balance,
          balanceHistory,
        });
      }
    } catch (error) {
      console.error("Error updating user balance: ", error);
    }
  };

  const FeedCard = ({ profilePic, name, time, title, content, views, likes = [], comments = [], id, imageUrl, userId }) => {
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentList, setCommentList] = useState(comments);
    const [localLikes, setLocalLikes] = useState(likes);
    const [liked, setLiked] = useState(Array.isArray(likes) && likes.includes(currentUser?.uid));
    
    const incrementViewCount = async () => {
      const postDocRef = doc(db, 'posts', id);
      try {
        await updateDoc(postDocRef, {
          views: views + 1,
        });
      } catch (error) {
        console.error("Error updating view count: ", error);
      }
    };

    useEffect(() => {
      incrementViewCount();
      updateUserBalance(views + 1, localLikes.length, userId);
    }, []);

    const toggleLike = async () => {
      if (!currentUser) return;
      
      const postDocRef = doc(db, 'posts', id);
      try {
        if (liked) {
          setLocalLikes(prev => prev.filter(uid => uid !== currentUser.uid));
          setLiked(false);
          
          await updateDoc(postDocRef, {
            likes: arrayRemove(currentUser.uid)
          });
        } else {
          setLocalLikes(prev => [...prev, currentUser.uid]);
          setLiked(true);
          
          await updateDoc(postDocRef, {
            likes: arrayUnion(currentUser.uid)
          });
        }
        
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === id 
              ? { ...post, likes: liked 
                  ? post.likes.filter(uid => uid !== currentUser.uid)
                  : [...post.likes, currentUser.uid] 
                }
              : post
          )
        );
      } catch (error) {
        console.error("Error toggling like: ", error);
        setLiked(!liked);
        setLocalLikes(likes);
      }
    };

    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!commentText.trim() || !currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        const postDocRef = doc(db, 'posts', id);
        const timestamp = new Date().toISOString();
        
        const newComment = {
          text: commentText,
          user: currentUser.displayName || 'Anonymous',
          timestamp,
          userId: currentUser.uid,
          profilePic: userData?.profilePic || null
        };
        
        const updatedComments = [...commentList, newComment];
        setCommentList(updatedComments);
        setCommentText('');
        
        await updateDoc(postDocRef, { 
          comments: updatedComments
        });
      } catch (error) {
        console.error("Error adding comment: ", error);
        setCommentList(commentList);
      }
    };

    useEffect(() => {
      const fetchCommentUserProfiles = async () => {
        const updatedComments = await Promise.all(
          commentList.map(async (comment) => {
            if (!comment.profilePic && comment.userId) {
              try {
                const userDocRef = doc(db, 'users', comment.userId);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data();
                return { ...comment, profilePic: userData?.profilePic || null };
              } catch (error) {
                console.error("Error fetching user profile:", error);
                return comment;
              }
            }
            return comment;
          })
        );

        if (JSON.stringify(updatedComments) !== JSON.stringify(commentList)) {
          setCommentList(updatedComments);
          const postDocRef = doc(db, 'posts', id);
          await updateDoc(postDocRef, { comments: updatedComments });
        }
      };

      fetchCommentUserProfiles();
    }, []);

    const formatTimestamp = (timestamp) => {
      const now = new Date();
      const commentDate = new Date(timestamp);
      const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
      }
    };
    const closeModal = () => {
      const commentBox = document.querySelector('.comment-box');
      commentBox?.classList.remove('show');
      setTimeout(() => {
        setCommentModalVisible(false);
      }, 300);
    };

    const openModal = () => {
      setCommentModalVisible(true);
      setTimeout(() => {
        const commentBox = document.querySelector('.comment-box');
        commentBox?.classList.add('show');
      }, 10);
    };

    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape' && isCommentModalVisible) {
          closeModal();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isCommentModalVisible]);


    const handleEdit = () => router.push(`/Learn&Share/Forums/${id}`);
    
    const handleDelete = async () => {
      try {
        await deleteDoc(doc(db, 'posts', id));
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    };

    return (
      <div className="feed-card border flex flex-col justify-center w-full max-w-3xl p-6 rounded-lg bg-white shadow-lg mb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
            <span>{profilePic}</span>
          </div>
          <div>
            <p className="font-bold text-lg">{name}</p>
            <p className="text-gray-500 text-sm">{time}</p>
          </div>
        </div>

        <h2 className="font-bold text-xl mb-2">{title}</h2>

        <div className="mb-4">
          {imageUrl && <img src={imageUrl} alt="Post" className="w-full h-72 rounded-lg object-cover" />}
          <p className="text-gray-700 mt-2">{content}</p>
        </div>

        <div className="flex justify-between items-center text-gray-500 text-sm">
          <div>👁️ {views}</div>
          <button 
            onClick={toggleLike} 
            className="text-sm flex items-center gap-1 transition-all duration-200 hover:scale-110"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span className="transform transition-transform duration-200 hover:scale-125">
              {liked ? '❤️' : '🤍'}
            </span>
            <span>{localLikes.length}</span>
            <span>Like</span>
          </button>
          <button 
            onClick={openModal}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors"
          >
            <i className="bi bi-chat-square-text"></i>
            {commentList.length} Comments
          </button>
          {currentUser && currentUser.uid === userId && (
            <div className="flex space-x-2">
              <button onClick={handleEdit} className="text-blue-500">Edit</button>
              <button onClick={handleDelete} className="text-red-500">Delete</button>
            </div>
          )}
        </div>

        {isCommentModalVisible && (
          <StyledModal>
            <div className="modal fixed inset-0 z-50 flex items-center justify-center" onClick={closeModal}>
              <div className="comment-box w-full max-w-2xl rounded-xl shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition duration-200">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                {/* Comments List */}
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {commentList.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {comment.profilePic ? (
                              <img 
                                src={comment.profilePic} 
                                alt={comment.user} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40';
                                }}
                              />
                            ) : (
                              <i className="bi bi-person-fill text-gray-600"></i>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{comment.user}</h3>
                            <p className="text-sm text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {currentUser?.profilePic ? (
                        <img 
                          src={currentUser.profilePic} 
                          alt={currentUser.displayName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40';
                          }}
                        />
                      ) : (
                        <i className="bi bi-person-fill text-gray-600"></i>
                      )}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="flex-grow">
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full p-3 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5f9ea0] focus:border-transparent outline-none resize-none placeholder-gray-400"
                        rows="3"
                        placeholder="Write a comment..."
                      />
                      <button 
                        type="submit"
                        className="mt-2 bg-[#5f9ea0] hover:bg-[#4f8e90] text-white font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out"
                      >
                        Post Comment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </StyledModal>
        )}
      </div>
    );
};

  const handleCreatePost = () => router.push('Forums/Create-Page');
  const toggleMyPosts = () => setShowMyPosts((prev) => !prev);

  return (
    <div className="w-4/5 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feeds</h1>
        <div className="flex space-x-4">
          <StyledWrapper>
            <button className="ui-btn" onClick={handleCreatePost}><span>Create Post</span></button>
          </StyledWrapper>
          <StyledWrapper>
            <button 
              className={`ui-btn ${showMyPosts ? 'my-posts' : ''}`}
              onClick={toggleMyPosts}
            >
              <span>
                {showMyPosts ? 'All Posts' : 'My Post'}
              </span>
            </button>
          </StyledWrapper>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"><Loader /></div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {posts.map((post) => <FeedCard key={post.id} {...post} />)}
        </div>
      )}
    </div>
  );
}

const StyledWrapper = styled.div`
  .ui-btn {
    --btn-default-bg: rgb(41, 41, 41);
    --btn-padding: 15px 20px;
    --btn-hover-bg: rgb(51, 51, 51);
    --btn-transition: .3s;
    --btn-letter-spacing: .1rem;
    --btn-animation-duration: 1.2s;
    --btn-shadow-color: rgba(0, 0, 0, 0.137);
    --btn-shadow: 0 2px 10px 0 var(--btn-shadow-color);
    --hover-btn-color: #FCA5A5;
    --default-btn-color: #fff;
    --font-size: 16px;
    --font-weight: 600;
    --font-family: Menlo,Roboto Mono,monospace;
  }

  .ui-btn {
    box-sizing: border-box;
    padding: var(--btn-padding);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--default-btn-color);
    font: var(--font-weight) var(--font-size) var(--font-family);
    background: var(--btn-default-bg);
    border: none;
    cursor: pointer;
    transition: var(--btn-transition);
    overflow: hidden;
    box-shadow: var(--btn-shadow);
  }

  .ui-btn:hover {
    background: var(--btn-hover-bg);
    transition: var(--btn-transition);
    transform: scale(1.05);
    letter-spacing: var(--btn-letter-spacing);
    color: var(--hover-btn-color);
  }

  .my-posts {
    background-color: #2f855a;
  }
`;

export default Feed;