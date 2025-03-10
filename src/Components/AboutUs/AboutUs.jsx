import React from "react";
import "./AboutUs.css";
import aboutImage from "../../assets/aboutus.png";

const AboutUs = () => {
  return (
    <section className="about-section">
      <div className="container">
        <div className="section-header">
          <h3 className="section-subtitle">ABOUT WEFUND</h3>
          <h2 className="section-title">Together, we’re building a world where every dream has the chance to thrive</h2>
        </div>
        
        <div className="about-content">
          {/* Left Side - Image with overlay and accent */}
          <div className="about-image-container">
            <div className="image-accent"></div>
            <div className="about-image">
              <img src={aboutImage} alt="About Wefund" />
            </div>
          </div>

          {/* Right Side - Text with enhanced styling */}
          <div className="about-text">
            <p className="about-description">
              At <span className="brand-name">WeFund</span>, we believe in the power of collective support to turn dreams into reality. Our 
              platform connects passionate individuals, startups, and social causes with a community eager to 
              contribute.
            </p>
            
            <div className="value-props">
              <div className="value-prop">
                <div className="value-icon">💡</div>
                <div className="value-content">
                  <h4>Innovation</h4>
                  <p>Supporting creative ideas and innovative solutions</p>
                </div>
              </div>
              
              <div className="value-prop">
                <div className="value-icon">❤️</div>
                <div className="value-content">
                  <h4>Community</h4>
                  <p>Building a supportive community of changemakers</p>
                </div>
              </div>
              
              <div className="value-prop">
                <div className="value-icon">🌱</div>
                <div className="value-content">
                  <h4>Impact</h4>
                  <p>Creating meaningful impact through collective action</p>
                </div>
              </div>
            </div>
            
            <p className="about-cta">
              Join us in making a difference, one contribution at a time.
            </p>
            
            <button className="about-button">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;