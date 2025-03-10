import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

// Define ChevronDown component
const ChevronDown = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Hero = () => {
  const navigate = useNavigate();
  const campaignSectionRef = useRef(null);

  const handleButtonClick = () => {
    navigate('/form');
  };

  const scrollToCampaigns = () => {
    campaignSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='hero'>
      <div className="hero-gradient"></div>
      <div className="hero-text-container">
        <h3 className="hero-title">
          Together We Grow
        </h3>
        <p className="hero-subtitle">
          The Home for Crowdfunding Hope
        </p>
        <h1 className="hero-heading">
          BUILDING A BETTER FUTURE STARTS HERE
        </h1>
      </div>
      <button className='btnn' onClick={handleButtonClick}>
        Start A WeFund
      </button>

      {/* Scroll down indicator */}
      <div className="scroll-down" onClick={scrollToCampaigns}>
        <ChevronDown />
      </div>

      {/* Ref to target campaign section */}
      <div ref={campaignSectionRef}></div>
    </div>
  );
};

export default Hero;