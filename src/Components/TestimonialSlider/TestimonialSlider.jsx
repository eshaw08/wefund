import React, { useState, useEffect, useRef } from "react";
import "./TestimonialSlider.css";

const testimonials = [
  {
    id: 1,
    name: "Emily Williams",
    location: "Mumbai, India",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "Supporting projects on WeFund has been an incredible experience! It brings together passionate creators and a strong community, making the funding process smooth, transparent, and accessible. The platform provides a great space for innovative ideas to come to life, and I'm truly impressed by how easy it is to support and discover amazing projects. Highly recommended!",
    rating: 5
  },
  {
    id: 2,
    name: "William Jackson",
    location: "London, United Kingdom",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    text: "This platform is a game-changer for small businesses and creative projects, providing them with the essential support they need to grow and thrive. By connecting passionate entrepreneurs with a community of backers, it opens up new opportunities for funding and collaboration. The user-friendly interface and transparent process make it easy for anyone to launch and support innovative ideas. A truly fantastic initiative that empowers creators and helps bring their visions to life!",
    rating: 5
  },
  {
    id: 3,
    name: "Sophia Brown",
    location: "Toronto, Canada",
    image: "https://randomuser.me/api/portraits/women/46.jpg",
    text: "I absolutely love the simplicity of WeFund. The platform is designed with a clean and intuitive interface, making it incredibly easy for both project creators and supporters to navigate. Setting up a campaign is straightforward, and donors can contribute seamlessly without any complications. The entire process, from discovering innovative projects to making donations, is smooth and hassle-free. With its user-friendly design, secure transactions, and commitment to transparency.",
    rating: 4
  },
  {
    id: 4,
    name: "Michael Lee",
    location: "Sydney, Australia",
    image: "https://randomuser.me/api/portraits/men/47.jpg",
    text: "This website is truly an outstanding platform for bringing creative ideas to life! From the moment I started my fundraising campaign, the entire process was seamless and incredibly user-friendly. Setting up my project was simple, and the intuitive design made it easy to reach potential backers. The transparent funding process ensured that both creators and supporters had complete confidence in their contributions. I was able to connect with a passionate community that genuinely believed in my vision.",
    rating: 5
  }
];

// Group testimonials into pairs
const testimonialPairs = [];
for (let i = 0; i < testimonials.length; i += 2) {
  testimonialPairs.push(
    testimonials.slice(i, i + 2)
  );
}

const TestimonialSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoplayRef = useRef(null);
  const carouselRef = useRef(null);

  // Handle automatic sliding
  useEffect(() => {
    autoplayRef.current = setTimeout(() => {
      nextTestimonial();
    }, 8000);
    
    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
      }
    };
  }, [activeIndex]);

  // Pause autoplay when user interacts with the carousel
  const pauseAutoplay = () => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
    }
  };

  // Resume autoplay after user interaction
  const resumeAutoplay = () => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
    }
    autoplayRef.current = setTimeout(() => {
      nextTestimonial();
    }, 8000);
  };

  const nextTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonialPairs.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonialPairs.length - 1 : prevIndex - 1
    );
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const goToTestimonial = (index) => {
    if (isAnimating || index === activeIndex) return;
    
    setIsAnimating(true);
    setActiveIndex(index);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Touch event handlers for mobile swipe functionality
  const handleTouchStart = (e) => {
    pauseAutoplay();
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Optional: add visual feedback during swipe
    if (carouselRef.current) {
      const swipeDistance = touchEnd - touchStart;
      if (Math.abs(swipeDistance) > 30) {
        const translateValue = swipeDistance / 10; // Reduce the movement for a subtle effect
        carouselRef.current.style.transform = `translateX(${translateValue}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = ""; // Reset any drag transform
    }
    
    if (touchStart - touchEnd > 70) {
      // Swipe left
      nextTestimonial();
    } else if (touchStart - touchEnd < -70) {
      // Swipe right
      prevTestimonial();
    }
    
    resumeAutoplay();
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
            {i < rating ? (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
              </svg>
            )}
          </span>
        ))}
      </div>
    );
  };

  // Progress bar for autoplay visualization
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const updateProgress = () => {
      const increment = 100 / (8000 / 100); // 100% divided by 80 intervals of 100ms
      setProgress(prev => (prev + increment > 100 ? 0 : prev + increment));
    };
    
    const progressInterval = setInterval(updateProgress, 100);
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [activeIndex]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="testimonial-header">
          <h3 className="testimonial-subtitle">OUR HAPPY USERS</h3>
          <h2 className="testimonial-title">What People Are Saying</h2>
          <div className="testimonial-decoration">
            <div className="decoration-line"></div>
            <span className="quotation-mark">
              <svg width="40" height="40" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z" />
              </svg>
            </span>
          </div>
        </div>
        
        <div className="testimonial-slider" 
          onMouseEnter={pauseAutoplay} 
          onMouseLeave={resumeAutoplay}
        >
          <div className="testimonial-container">
            <button 
              className="nav-button prev" 
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            
            <div className="testimonial-carousel" 
              ref={carouselRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="carousel-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {testimonialPairs.map((pair, pairIndex) => (
                  <div 
                    key={`pair-${pairIndex}`} 
                    className="testimonial-pair"
                  >
                    {pair.map((testimonial) => (
                      <div 
                        key={testimonial.id} 
                        className="testimonial-card"
                      >
                        <div className="testimonial-content">
                          <div className="testimonial-card-header">
                            {renderStars(testimonial.rating)}
                            <div className="quote-icon">
                              <svg width="30" height="30" viewBox="0 0 24 24" opacity="0.1">
                                <path fill="currentColor" d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z" />
                              </svg>
                            </div>
                          </div>
                          <p className="testimonial-text">{testimonial.text}</p>
                          <div className="testimonial-footer">
                            <div className="testimonial-avatar">
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.name} 
                                className="testimonial-image" 
                                loading="lazy"
                              />
                            </div>
                            <div className="testimonial-info">
                              <h4 className="testimonial-name">{testimonial.name}</h4>
                              <p className="testimonial-location">
                                <svg viewBox="0 0 24 24" width="14" height="14" className="location-icon">
                                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {testimonial.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="nav-button next" 
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>
          </div>
          
          <div className="testimonial-controls">
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            
            <div className="testimonial-indicators">
              {testimonialPairs.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => goToTestimonial(index)}
                  aria-label={`Go to testimonial pair ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : "false"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;