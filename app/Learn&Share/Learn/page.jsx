"use client"
import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import img from '../../../public/images/study-image.jpg';
import Link from 'next/link';
const Home = () => {
  return (
    <div className="text-white min-h-screen p-6 font-sans">
      <header className="flex flex-col lg:flex-row items-center lg:justify-between mb-16">
        <div className="ml-[180px] mt-10 lg:w-1/2 mb-8 lg:mb-0">
          <h1 className="text-4xl font-bold mb-4 text-black">"Unlock Your Learning <br/><span className='ml-[140px]'> Potential Today"</span></h1>
          <p className="text-lg mb-6 text-black">
            Explore a world of knowledge, master new skills, and achieve your academic goals with expert guidance and interactive resources designed for you.
          </p>
          <Link href="/Learn&Share/Learn/Classes">
          <button className="border border-white px-6 py-2 hover:bg-white hover:text-black transition duration-200">
            Get Involved
          </button>
          </Link>
        </div>
        <div className="lg:w-1/3">
          <Image src={img} alt="Books and study materials" width={370} height={250} className="rounded-lg shadow-lg mr-[120px]" />
        </div>
      </header>

      <section className="text-center">
        <h2 className="text-2xl mb-4 text-black">Explore our platform to gain knowledge and enhance your skills.</h2>
        <nav className="flex justify-center space-x-6 mb-8 text-gray-400">
          <div className="text-blue-400 border-b-2 border-red-500 pb-1">Recent</div>
          <div href="#" className="hover:text-blue-400">Most Popular</div>
        </nav>

        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3].map((_, index) => (
            <StyledWrapper key={index}>
              <article className="article-wrapper">
                <div className="container-project"></div>
                <div className="project-info">
                  <div className="flex-pr">
                    <div className="project-title text-nowrap">Project</div>
                    <div className="project-hover">
                      <svg style={{color: 'black'}} xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" color="black" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor"><line y2={12} x2={19} y1={12} x1={5} /><polyline points="12 5 19 12 12 19" /></svg>
                    </div>
                  </div>
                  <div className="types">
                    <span style={{backgroundColor: 'rgba(165, 96, 247, 0.43)', color: 'rgb(85, 27, 177)'}} className="project-type">• Analytics</span>
                    <span className="project-type">• Dashboards</span>
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
    -webkit-transition: 0.15s all ease-in-out;
    transition: 0.15s all ease-in-out;
    border-radius: 10px;
    padding: 5px;
    border: 4px solid transparent;
    cursor: pointer;
    background-color: white;
  }

  .article-wrapper:hover {
    -webkit-box-shadow: 10px 10px 0 #4e84ff, 20px 20px 0 #4444bd;
    box-shadow: 10px 10px 0 #4e84ff, 20px 20px 0 #4444bd;
    border-color: #0578c5;
    -webkit-transform: translate(-20px, -20px);
    -ms-transform: translate(-20px, -20px);
    transform: translate(-20px, -20px);
  }

  .article-wrapper:active {
    -webkit-box-shadow: none;
    box-shadow: none;
    -webkit-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0);
  }

  .types {
    gap: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    place-content: flex-start;
  }

  .article-wrapper:hover .project-hover {
    -webkit-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
    background-color: #a6c2f0;
  }

  .project-info {
    padding-top: 20px;
    padding: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    gap: 20px;
  }

  .project-title {
    font-size: 2em;
    margin: 0;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: black;
  }

  .flex-pr {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .project-type {
    background: #b2b2fd;
    color: #1a41cd;
    font-weight: bold;
    padding: 0.3em 0.7em;
    border-radius: 15px;
    font-size: 12px;
    letter-spacing: -0.6px;
  }

  .project-hover {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 9px;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
  }

  .container-project {
    width: 100%;
    height: 170px;
    background: gray;
  }
`;

export default Home;
