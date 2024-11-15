"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import firebaseApp from '../../../firebaseConfig';
import Link from 'next/link';
import './Classes/SharedStyles.css';
import Loader from '../loader';

const Home = () => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchClassesData = async () => {
      const querySnapshot = await getDocs(collection(db, 'classesCollection'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setClassesData(data);
      setLoading(false); // Stop loading once data is fetched
    };

    fetchClassesData();
  }, [db]);

  return (
    <div className="text-white min-h-screen p-6 font-sans ">
      <header className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-16 ">
        <div className="md:ml-[180px] mt-10 md:w-1/2 mb-8 md:mb-0">
          <p className="text-3xl md:text-4xl w-fit font-bold mb-4 text-black">
            "Unlock Your Learning <br/><span className='ml-0 md:ml-48'>Potential Today"</span>
          </p>
          <p className="text-base md:text-lg mb-6 text-black">
            Explore a world of knowledge, master new skills, and achieve your academic goals with expert guidance and interactive resources designed for you.
          </p>
          <Link href="/Learn&Share/Learn/Classes">
            <button className="border border-black text-black px-6 py-2 hover:bg-white hover:text-black transition duration-200 text-sm md:text-base">
              Get Involved
            </button>
          </Link>
        </div>
        <div className="md:w-1/3 mt-8 md:mt-0">
          <Image src="/images/study-image.jpg" alt="Books and study materials" width={370} height={250} className="rounded-lg shadow-lg mx-auto" />
        </div>
      </header>

      <section className="text-center">
        <h2 className="text-xl md:text-2xl mb-4 text-black">Explore our platform to gain knowledge and enhance your skills.</h2>
        <nav className="flex justify-center space-x-6 mb-8 text-gray-400">
          <div className="text-blue-400 border-b-2 border-red-500 pb-1">Recent</div>
          <div href="#" className="hover:text-blue-400">Upcoming</div>
        </nav>

        {loading ? ( 
          <div className="flex justify-center items-center h-[13em]">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 ">
            {classesData.map((classData) => (
              <Link href={`/Learn&Share/Learn/${classData.id}`} key={classData.id}>
                <div className="article-wrapper">
                  <div className="container-project">
                    {classData.imageUrl && (
                      <img src={classData.imageUrl} alt="Class Image" className="w-full h-full object-cover rounded-t-md" />
                    )}
                  </div>
                  <div className="project-info">
                    <div className="flex-pr">
                      <div className="project-title text-left">{classData.className}</div>
                      <div className="project-hover">
                        <svg style={{ color: 'black' }} xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor">
                          <line x1={5} y1={12} x2={19} y2={12} />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center text-black">{classData.classDate}</div>
                    <div className="types flex gap-2 justify-center">
                      <span style={{ backgroundColor: 'rgba(165, 96, 247, 0.43)', color: 'rgb(85, 27, 177)' }} className="project-type">• {classData.classType}</span>
                      <span className="project-type">• {classData.standard}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
