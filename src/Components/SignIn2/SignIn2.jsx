// SignIn2.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Import from firebase.js
import { useNavigate, useLocation } from "react-router-dom";
import "./SignIn2.css";
import logoImage from "../../assets/logo.png";

const SignIn2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setSuccessMessage("Sign-in successful! Redirecting...");
      localStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Error signing in:", err.message);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("Failed to sign in. Please check your credentials.");
      }
    }
  };

  return (
    <div className="signin2-container">
      <div className="signin2-card">
        <img src={logoImage} alt="Wefund logo" className="logo-image" />
        <h2 className="signin-heading">Sign In</h2>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSignIn} className="form-container">
          <input
            type="email"
            value={email}
            className="email-input"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="forgot-password" onClick={() => navigate("/reset-password")}>
            Forgot your password?
          </p>
          <p className="terms">
            By clicking the Sign In button below, you agree to the Crowdf{" "}
            <a href="#">Terms of Service</a> and acknowledge the{" "}
            <a href="#">Privacy Notice</a>.
          </p>
          <button type="submit" className="signin-button">Sign In</button>
          <button type="button" className="back-button" onClick={() => navigate(-1)}>Back</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn2;