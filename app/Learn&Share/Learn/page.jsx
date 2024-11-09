"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import firebaseApp from '../../../firebaseConfig';
import Link from 'next/link';

const Home = () => {
  const [classesData, setClassesData] = useState([]);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchClassesData = async () => {
      const querySnapshot = await getDocs(collection(db, 'classesCollection'));
      const data = querySnapshot.docs.map(doc => doc.data());
      setClassesData(data);
    };

    fetchClassesData();
  }, [db]);

  return (
    <div className="text-white min-h-screen p-6 font-sans">
      <header className="flex flex-col lg:flex-row items-center lg:justify-between mb-16">
        <div className="ml-[180px] mt-10 lg:w-1/2 mb-8 lg:mb-0">
          <h1 className="text-4xl w-fit font-bold mb-4 text-black">"Unlock Your Learning <br/><span className='pl-[140px]'> Potential Today"</span></h1>
          <p className="text-lg mb-6 text-black">
            Explore a world of knowledge, master new skills, and achieve your academic goals with expert guidance and interactive resources designed for you.
          </p>
          <Link href="/Learn&Share/Learn/Classes">
            <button className="border border-black  text-black px-6 py-2 hover:bg-white hover:text-black transition duration-200">
              Get Involved
            </button>
          </Link>
        </div>
        <div className="lg:w-1/3">
          <Image src="/images/study-image.jpg" alt="Books and study materials" width={370} height={250} className="rounded-lg shadow-lg mr-[120px]" />
        </div>
      </header>

      <section className="text-center">
        <h2 className="text-2xl mb-4 text-black">Explore our platform to gain knowledge and enhance your skills.</h2>
        <nav className="flex justify-center space-x-6 mb-8 text-gray-400">
          <div className="text-blue-400 border-b-2 border-red-500 pb-1">Recent</div>
          <div href="#" className="hover:text-blue-400">Upcoming</div>
        </nav>

        <div className="flex flex-wrap justify-center gap-6">
          {classesData.map((classData, index) => (
            <StyledWrapper key={index}>
              <article className="article-wrapper">
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
                  <div className="text-left text-black">{classData.classDate}</div>
                  <div className="types">
                    <span style={{ backgroundColor: 'rgba(165, 96, 247, 0.43)', color: 'rgb(85, 27, 177)' }} className="project-type">• {classData.classType}</span>
                    <span className="project-type">• {classData.standard}</span>
                  </div>
                </div>
              </article>
            </StyledWrapper>
          ))}
        </div>
      </section>
    </div>
  );
};

const StyledWrapper = styled.div`
  .article-wrapper {
    width: 250px;
    transition: 0.15s all ease-in-out;
    border-radius: 10px;
    padding: 5px;
    border: 4px solid transparent;
    cursor: pointer;
    background-color: white;
  }

  .article-wrapper:hover {
    box-shadow: 10px 10px 0 #4e84ff, 20px 20px 0 #4444bd;
    border-color: #0578c5;
    transform: translate(-20px, -20px);
  }

  .article-wrapper:active {
    box-shadow: none;
    transform: translate(0, 0);
  }

  .container-project {
    width: 100%;
    height: 170px;
    background: gray;
    overflow: hidden;
  }

  .types {
    display: flex;
    gap: 10px;
  }

  .project-info {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .project-title {
    font-size: 1.5em;
    font-weight: 600;
    color: black;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .flex-pr {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .project-type {
    background: #b2b2fd;
    color: #1a41cd;
    font-weight: bold;
    padding: 0.3em 0.7em;
    border-radius: 15px;
    font-size: 12px;
  }

  .project-hover {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 9px;
    transition: all 0.3s ease;
  }

  .article-wrapper:hover .project-hover {
    transform: rotate(-45deg);
    background-color: #a6c2f0;
  }
`;

export default Home;
