import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <section className="contact-section">
      <div className="container">
        <div className="contact-header">
          <span className="contact-subtitle">Get in Touch</span>
          <h2 className="contact-title">Contact Us</h2>
          <p className="contact-intro">
            Have questions or need assistance? Our team is ready to help you. 
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="contact-content">
          {/* Left Side - Contact Form */}
          <div className="contact-form-container">
            <form>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" placeholder="Enter your full name" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" placeholder="Enter your email address" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" placeholder="Enter your phone number" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea placeholder="How can we help you?" required></textarea>
              </div>

              {/* Captcha and Submit */}
              <div className="captcha-container">
                <input type="checkbox" id="captcha" className="captcha-checkbox" required />
                <label htmlFor="captcha">I'm not a robot</label>
              </div>
              
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>

          {/* Right Side - Contact Info Cards */}
          <div className="contact-info-container">
            {/* Email Us Card */}
            <div className="contact-info-card">
              <div className="card-title">
                <div className="card-icon">
                  <i className="fas fa-envelope"></i> {/* Email Us Icon */}
                </div>
                <h3 className="card-heading">Email Us</h3>
              </div>
              <p className="card-content">Contact@GreatStack.dev</p>
            </div>
            
            {/* Call Us Card */}
            <div className="contact-info-card">
              <div className="card-title">
                <div className="card-icon">
                  <i className="fas fa-phone-alt"></i> {/* Call Us Icon */}
                </div>
                <h3 className="card-heading">Call Us</h3>
              </div>
              <p className="card-content">+1 123-456-7890</p>
            </div>
            
            {/* Visit Us Card */}
            <div className="contact-info-card">
              <div className="card-title">
                <div className="card-icon">
                  <i className="fas fa-map-marker-alt"></i> {/* Visit Us Icon */}
                </div>
                <h3 className="card-heading">Visit Us</h3>
              </div>
              <p className="card-content">77 Massachusetts Ave, Cambridge, MA 02139, United States</p>
            </div>
            
            {/* Follow Us Card */}
            <div className="contact-info-card">
              <div className="card-title">
                <div className="card-icon">
                  <i className="fas fa-share-alt"></i> {/* Follow Us Icon */}
                </div>
                <h3 className="card-heading">Follow Us</h3>
              </div>
              <div className="social-links">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i> {/* Facebook Icon */}
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <i className="fab fa-twitter"></i> {/* Twitter Icon */}
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <i className="fab fa-instagram"></i> {/* Instagram Icon */}
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i> {/* LinkedIn Icon */}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;