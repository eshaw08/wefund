// SignIn.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase"; // Import from firebase.js
import "./SignIn.css";
import { FaGoogle } from "react-icons/fa";
import logoImage from "../../assets/logo.png";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name || "";
  const prefilledEmail = location.state?.email || "";

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(isEmailValid(e.target.value) ? "" : "Invalid email format.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEmailValid(email)) {
      navigate("/signin2", { state: { email } });
    } else {
      setError("Please enter a valid email address.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      navigate("/", { state: { email: user.email, name: user.displayName } });
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      setError("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <img src={logoImage} alt="Wefund logo" className="logo-image" />
        <h1 className="welcome-heading">Welcome {userName}</h1>
        <p className="subtext">Log in to WeFund to continue.</p>

        {/* Google Sign-In */}
        <button className="signin-button google" onClick={handleGoogleSignIn}>
          <FaGoogle className="icon" />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="divider">or</div>

        {/* Email Input Form */}
        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="email"
            placeholder="Email Address"
            className="email-input"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className={`signin-button continue ${isEmailValid(email) ? "active" : ""}`}
            disabled={!isEmailValid(email)}
          >
            Continue
          </button>
        </form>

        {/* Privacy Notice */}
        <div className="privacy">
          <p>
            This site is protected by reCAPTCHA and the Google{" "}
            <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Terms of Service</a> apply.
          </p>
        </div>

        {/* Sign-Up Link */}
        <p className="signup-link">
          Don’t have an account?{" "}
          <a href="#" onClick={() => navigate("/signup")}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;