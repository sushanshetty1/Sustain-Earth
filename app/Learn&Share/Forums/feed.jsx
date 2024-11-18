"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { useRouter } from 'next/navigation'; 
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styled from 'styled-components';
import Loader from './loader';

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

  const updateUserBalance = async () => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      let dailyBalance = userData.dailyBalance || 0;
      let balance = userData.balance || 0;
      const lastUpdated = userData.lastUpdated || null;
      const currentDate = new Date().toDateString();

      if (lastUpdated !== currentDate) {
        dailyBalance = 0;
    }

      // Increment dailyBalance by 5 without exceeding 250
      if (dailyBalance < 250) {
        const increment = Math.min(5, 250 - dailyBalance); // Ensure we don't exceed 250
        await updateDoc(userDocRef, {
          dailyBalance: dailyBalance + increment,
          balance: balance + increment,
          lastUpdated: currentDate,
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
    }, []);
    const toggleLike = async () => {
      const postDocRef = doc(db, 'posts', id);
      if (liked) {
        await updateDoc(postDocRef, {
          likes: arrayRemove(currentUser.uid)
        });
        setLiked(false);
      } else {
        await updateDoc(postDocRef, {
          likes: arrayUnion(currentUser.uid)
        });
        setLiked(true);
      }
    };
  
    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (commentText.trim()) {
        try {
          const postDocRef = doc(db, 'posts', id);
          const loggedInUserName = currentUser ? currentUser.displayName : 'Anonymous';
          await updateDoc(postDocRef, { 
            comments: [...commentList, `${loggedInUserName}: ${commentText}`], 
          });
          setCommentList([...commentList, `${loggedInUserName}: ${commentText}`]);
          setCommentText('');
        } catch (error) {
          console.error("Error adding comment: ", error);
        }
      }
    };
  
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
          <button onClick={toggleLike} className="text-sm" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {liked ? '❤️' : '🤍'} {likes.length} Like 
          </button>
          <button onClick={() => setCommentModalVisible(true)}>💬 {commentList.length} Comments</button>
          {currentUser && currentUser.uid === userId && (
            <div className="flex space-x-2">
              <button onClick={handleEdit} className="text-blue-500">Edit</button>
              <button onClick={handleDelete} className="text-red-500">Delete</button>
            </div>
          )}
        </div>
  
        {isCommentModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCommentModalVisible(false)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setCommentModalVisible(false)} className="absolute top-4 right-4 text-gray-500">✕</button>
              <div className="space-y-2 mb-4 overflow-y-auto max-h-64">
                {commentList.map((comment, index) => (
                  <div key={index} className="bg-gray-100 rounded-md p-2">
                    <p className="text-sm">{comment}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="flex items-center">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-grow p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200" />
                <button type="submit" className="ml-2 text-blue-500 font-semibold">Post</button>
              </form>
            </div>
          </div>
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
