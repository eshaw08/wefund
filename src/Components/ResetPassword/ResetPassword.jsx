// ResetPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase"; // Import from firebase.js
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import logoImage from "../../assets/logo.png";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox!");
    } catch (err) {
      console.error("Reset Password Error:", err.message);
      setError("Failed to send reset email. Check your email address.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <img src={logoImage} alt="Wefund logo" className="logo-image" />
        <h2 className="signin-heading">Reset Password</h2>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleReset}>
          <input
            type="email"
            value={email}
            className="email-input"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <p className="terms">
            Enter your email we'll send you a link to get back into your account.
          </p>

          <button type="submit" className="reset-button">Send Reset Email</button>
          <button type="button" className="back-button" onClick={() => navigate(-1)}>Back</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;