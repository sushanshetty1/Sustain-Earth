"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { useRouter } from 'next/navigation'; 
import { collection, getDoc, getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, getDoc as getSingleDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import Loader from './loader';
import { PlusCircle, UserCircle, Eye, Heart, MessageCircle, X, Reply, Trash2 } from 'lucide-react';

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

  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .image-modal.show {
    opacity: 1;
  }

  .modal-image {
    max-width: 90%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    transform: scale(0.9);
    transition: transform 0.3s ease-in-out;
  }

  .image-modal.show .modal-image {
    transform: scale(1);
  }

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    padding: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const ImageModal = ({ imageUrl, onClose }) => {
    useEffect(() => {
      const modalElement = document.querySelector('.image-modal');
      setTimeout(() => modalElement?.classList.add('show'), 10);
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
      <div className="image-modal" onClick={onClose}>
        <button className="close-button" onClick={onClose}>
          <X size={24} color="white" />
        </button>
        <img 
          src={imageUrl} 
          alt="Enlarged post" 
          className="modal-image"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

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
    const [commentList, setCommentList] = useState(comments.map(comment => ({
      ...comment,
      likes: Array.isArray(comment.likes) ? comment.likes : [],
      replies: Array.isArray(comment.replies) ? comment.replies.map(reply => ({
        ...reply,
        likes: Array.isArray(reply.likes) ? reply.likes : []
      })) : []
    })));
    const [localLikes, setLocalLikes] = useState(likes);
    const [liked, setLiked] = useState(Array.isArray(likes) && likes.includes(currentUser?.uid));
    const [replyingTo, setReplyingTo] = useState(null);
    const [userType, setUserType] = useState(null);

    useEffect(() => {
      const fetchUserType = async () => {
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setUserType(userDoc.data().type || 'User');
            }
          } catch (error) {
            console.error("Error fetching user type:", error);
          }
        }
      };
      fetchUserType();
    }, [currentUser]);

    const handleCommentLike = async (commentIndex, isReply = false, parentIndex = null) => {
      if (!currentUser) return;

      try {
        const updatedComments = [...commentList];
        let targetComment;

        if (isReply) {
          targetComment = updatedComments[parentIndex].replies[commentIndex];
        } else {
          targetComment = updatedComments[commentIndex];
        }

        // Ensure likes array exists
        if (!Array.isArray(targetComment.likes)) {
          targetComment.likes = [];
        }

        const isLiked = targetComment.likes.includes(currentUser.uid);

        if (isLiked) {
          targetComment.likes = targetComment.likes.filter(uid => uid !== currentUser.uid);
        } else {
          targetComment.likes.push(currentUser.uid);
        }

        setCommentList(updatedComments);
        
        const postDocRef = doc(db, 'posts', id);
        await updateDoc(postDocRef, {
          comments: updatedComments
        });
      } catch (error) {
        console.error("Error updating comment likes:", error);
      }
    };

    const handleReply = async (e, parentCommentIndex) => {
      e.preventDefault();
      if (!commentText.trim() || !currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        const newReply = {
          text: commentText,
          user: currentUser.displayName || 'Anonymous',
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
          profilePic: userData?.profilePic || null,
          likes: []
        };

        const updatedComments = [...commentList];
        if (!Array.isArray(updatedComments[parentCommentIndex].replies)) {
          updatedComments[parentCommentIndex].replies = [];
        }
        updatedComments[parentCommentIndex].replies.push(newReply);
        setCommentList(updatedComments);
        setCommentText('');
        setReplyingTo(null);

        const postDocRef = doc(db, 'posts', id);
        await updateDoc(postDocRef, {
          comments: updatedComments
        });
      } catch (error) {
        console.error("Error adding reply:", error);
      }
    };

    const handleDeleteComment = async (commentIndex, replyIndex = null) => {
      if (!currentUser) return;

      try {
        const updatedComments = [...commentList];
        const comment = updatedComments[commentIndex];

        const canDelete = 
          currentUser.uid === userId || // Post creator
          currentUser.uid === comment.userId || // Comment creator
          userType === 'Admin'; // Admin user

        if (!canDelete) {
          console.log("No permission to delete comment");
          return;
        }

        if (replyIndex !== null) {
          // Delete reply
          if (Array.isArray(comment.replies)) {
            comment.replies.splice(replyIndex, 1);
          }
        } else {
          // Delete entire comment
          updatedComments.splice(commentIndex, 1);
        }

        setCommentList(updatedComments);
        
        const postDocRef = doc(db, 'posts', id);
        await updateDoc(postDocRef, {
          comments: updatedComments
        });
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    };
        
    const CommentComponent = ({ 
      comment, 
      index, 
      isReply = false, 
      parentIndex = null, 
      handleCommentLike, 
      handleDeleteComment, 
      handleReply,
      currentUser, 
      userType, 
      userId,
      commentText,
      setCommentText,
      replyingTo,
      setReplyingTo
    }) => {
      const [isLiked, setIsLiked] = useState(
        Array.isArray(comment.likes) && currentUser && comment.likes.includes(currentUser?.uid)
      );
    
      useEffect(() => {
        setIsLiked(Array.isArray(comment.likes) && currentUser && comment.likes.includes(currentUser?.uid));
      }, [comment.likes, currentUser]);
      
      const handleLikeClick = () => {
        if (!currentUser) return;
        setIsLiked(!isLiked);
        handleCommentLike(index, isReply, parentIndex);
      };
    
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
    
      return (
        <div className={`bg-white p-4 rounded-lg border border-gray-100 shadow-sm 
          ${isReply ? 'ml-8 border-l-4 border-l-[#5f9ea0]' : ''}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                <UserCircle className="text-gray-400" />
              )}
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-gray-800">{comment.user}</h3>
                  <p className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {currentUser && (
                    <>
                      {!isReply && (
                        <button 
                          onClick={() => setReplyingTo(index)}
                          className="flex items-center gap-1 text-gray-500 hover:text-[#5f9ea0] transition-colors duration-200"
                        >
                          <Reply size={16} />
                          <span className="text-sm">Reply</span>
                        </button>
                      )}
                      <button 
                        onClick={handleLikeClick}
                        className={`flex items-center gap-1 transition-all duration-200 hover:scale-105
                          ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                      >
                        <Heart 
                          size={16} 
                          className={isLiked ? 'fill-current' : ''} 
                        />
                        <span className="text-sm">
                          {Array.isArray(comment.likes) ? comment.likes.length : 0}
                        </span>
                      </button>
                      {(currentUser.uid === userId || currentUser.uid === comment.userId || userType === 'Admin') && (
                        <button 
                          onClick={() => handleDeleteComment(isReply ? parentIndex : index, isReply ? index : null)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mt-2 leading-relaxed">{comment.text}</p>
              
              {Array.isArray(comment.replies) && comment.replies.length > 0 && !isReply && (
                <div className="mt-4 space-y-3">
                  {comment.replies.map((reply, replyIndex) => (
                    <CommentComponent 
                      key={replyIndex}
                      comment={reply}
                      index={replyIndex}
                      isReply={true}
                      parentIndex={index}
                      handleCommentLike={handleCommentLike}
                      handleDeleteComment={handleDeleteComment}
                      handleReply={handleReply}
                      currentUser={currentUser}
                      userType={userType}
                      userId={userId}
                      commentText={commentText}
                      setCommentText={setCommentText}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {replyingTo === index && (
            <div className="mt-4 pl-12">
              <form onSubmit={(e) => handleReply(e, index)} className="space-y-3">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 bg-gray-50 text-gray-800 border border-gray-200 rounded-lg 
                    focus:ring-2 focus:ring-[#5f9ea0] focus:border-transparent outline-none resize-none 
                    placeholder-gray-400 transition-all duration-200"
                  rows="2"
                  placeholder="Write a reply..."
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="bg-[#5f9ea0] hover:bg-[#4f8e90] text-white font-medium py-2 px-4 
                      rounded-lg transition duration-200 ease-in-out hover:shadow-md"
                  >
                    Reply
                  </button>
                  <button 
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 
                      rounded-lg transition duration-200 ease-in-out"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      );
    };

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
      <div className="feed-card border flex flex-col justify-center w-full max-w-3xl p-4 md:p-6 rounded-lg bg-white shadow-lg mb-4 md:mb-6">
        <div className="flex items-center mb-3 md:mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3 md:mr-4">
            <span>{profilePic}</span>
          </div>
          <div>
            <p className="font-bold text-base md:text-lg">{name}</p>
            <p className="text-gray-500 text-xs md:text-sm">{time}</p>
          </div>
        </div>

        <h2 className="font-bold text-lg md:text-xl mb-2">{title}</h2>

        <div className="mb-3 md:mb-4">
          {imageUrl && (
            <div className="cursor-pointer" onClick={() => setSelectedImage(imageUrl)}>
              <img 
                src={imageUrl} 
                alt="Post" 
                className="w-full h-48 md:h-72 rounded-lg object-cover hover:opacity-90 transition-opacity duration-200" 
                loading="lazy"
              />
            </div>
          )}
          <p className="text-gray-700 mt-2 text-sm md:text-base">{content}</p>
        </div>

        <div className="flex justify-between items-center text-gray-500 text-xs md:text-sm">
          <div className="flex items-center gap-1">
            <Eye size={isMobile ? 16 : 20} />
            <span>{views}</span>
            {!isMobile && <span className="ml-1">Views</span>}
          </div>
          <button 
            onClick={toggleLike} 
            className="flex items-center gap-1 transition-all duration-200 hover:scale-110"
          >
            <Heart 
              size={isMobile ? 16 : 20} 
              className={liked ? 'text-red-500 fill-current' : ''}
            />
            <span>{localLikes.length}</span>
            {!isMobile && <span className="ml-1">Likes</span>}
          </button>
          <button 
            onClick={openModal}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors"
          >
            <MessageCircle size={isMobile ? 16 : 20} />
            <span>{commentList.length}</span>
            {!isMobile && <span className="ml-1">Comments</span>}
          </button>
          {currentUser && currentUser.uid === userId && (
            <div className="flex space-x-2">
              <button onClick={handleEdit} className="text-blue-500 text-xs md:text-sm">Edit</button>
              <button onClick={handleDelete} className="text-red-500 text-xs md:text-sm">Delete</button>
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
                      <CommentComponent 
                        key={index}
                        comment={comment}
                        index={index}
                        handleCommentLike={handleCommentLike}
                        handleDeleteComment={handleDeleteComment}
                        handleReply={handleReply}
                        currentUser={currentUser}
                        userType={userType}
                        userId={userId}
                        commentText={commentText}
                        setCommentText={setCommentText}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                      />
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
  <div className="w-full md:w-4/5 p-3 md:p-4">
    <header className="flex justify-between items-center mb-4 md:mb-6">
      <h1 className="text-xl md:text-2xl font-bold">Feeds</h1>
      <div className="flex space-x-3 md:space-x-4">
        <StyledWrapper>
          {isMobile ? (
            <button className="ui-btn-mobile" onClick={handleCreatePost}>
              <PlusCircle size={24} />
            </button>
          ) : (
            <button className="ui-btn" onClick={handleCreatePost}>
              <span>Create Post</span>
            </button>
          )}
        </StyledWrapper>
        <StyledWrapper>
          {isMobile ? (
            <button 
              className={`ui-btn-mobile ${showMyPosts ? 'my-posts' : ''}`}
              onClick={toggleMyPosts}
            >
              <UserCircle size={24} />
            </button>
          ) : (
            <button 
              className={`ui-btn ${showMyPosts ? 'my-posts' : ''}`}
              onClick={toggleMyPosts}
            >
              <span>{showMyPosts ? 'All Posts' : 'My Post'}</span>
            </button>
          )}
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

    {selectedImage && (
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    )}
  </div>
);
}

const StyledWrapper = styled.div`
.ui-btn, .ui-btn-mobile {
  --btn-default-bg: rgb(41, 41, 41);
  --btn-hover-bg: rgb(51, 51, 51);
  --btn-transition: .3s;
  --btn-shadow-color: rgba(0, 0, 0, 0.137);
  --btn-shadow: 0 2px 10px 0 var(--btn-shadow-color);
  --hover-btn-color: #FCA5A5;
  --default-btn-color: #fff;
}

.ui-btn {
  --btn-padding: 15px 20px;
  --btn-letter-spacing: .1rem;
  --font-size: 16px;
  --font-weight: 600;
  --font-family: Menlo,Roboto Mono,monospace;
  
  padding: var(--btn-padding);
  font: var(--font-weight) var(--font-size) var(--font-family);
  letter-spacing: var(--btn-letter-spacing);
}

.ui-btn-mobile {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-btn, .ui-btn-mobile {
  color: var(--default-btn-color);
  background: var(--btn-default-bg);
  border: none;
  cursor: pointer;
  transition: var(--btn-transition);
  overflow: hidden;
  box-shadow: var(--btn-shadow);
}

.ui-btn:hover, .ui-btn-mobile:hover {
  background: var(--btn-hover-bg);
  transition: var(--btn-transition);
  transform: scale(1.05);
  color: var(--hover-btn-color);
}

.my-posts {
  background-color: #2f855a;
}
`;

export default Feed;