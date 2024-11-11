"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { useRouter } from 'next/navigation'; 
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Feed() {
  const [posts, setPosts] = useState([]);
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, 'posts');
        const querySnapshot = await getDocs(postsCollectionRef);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, []);

  const FeedCard = ({ profilePic, name, time, content, views, likes, comments = [], id, imageUrl }) => {
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentList, setCommentList] = useState(comments);
    const [liked, setLiked] = useState(false);

    const toggleLike = () => setLiked(!liked);

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
    return (
      <>
        <div className="border flex justify-center flex-col w-[95%] md:w-1/2 rounded-lg p-4 bg-white shadow-md mb-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <span>{profilePic}</span>
            </div>
            <div>
              <p className="font-bold">{name}</p>
              <p className="text-gray-500 text-sm">{time}</p>
            </div>
          </div>

          <div className="mb-4 h-52">
            {imageUrl && (
              <img src={imageUrl} alt="Post" className="w-full h-full object-cover rounded-lg" />
            )}

            {content}
          </div>

          <div className="flex justify-between items-center text-gray-500 text-sm">
            <div>👁️ {views}</div> 
            <button
              className="text-sm"
              onClick={toggleLike}
              style={{
                fontSize: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {liked ? '❤️' : '🤍'} Like
            </button>
            <button
              onClick={() => setCommentModalVisible(true)}
              className="focus:outline-none"
            >
              💬 {commentList.length} Comments
            </button>
          </div>
        </div>

        {isCommentModalVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setCommentModalVisible(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md md:max-w-lg lg:max-w-md lg:w-1/3 lg:right-0 lg:absolute lg:inset-y-0 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setCommentModalVisible(false)}
                className="absolute mb-6 top-4 right-4 text-gray-500"
              >
                ✕
              </button>
              <div className="space-y-2 mb-4 mt-7 max-h-64 overflow-y-auto">
                {commentList.map((comment, index) => (
                  <div key={index} className="bg-gray-100 rounded-md p-2">
                    <p className="text-sm">{comment}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="commentStyle flex items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
                <button type="submit" className="ml-2 text-blue-500 font-semibold">
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  const handleCreatePost = () => {
    router.push('Forums/Create-Page'); 
  };

  return (
    <div className="w-4/5 p-4">
      <header className="flex justify-evenly md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Feeds</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreatePost} 
        >
          Create Post
        </button>
      </header>

      <div className="flex flex-col items-center justify-center w-full ">
        {posts.map((post) => (
          <FeedCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}

export default Feed;
