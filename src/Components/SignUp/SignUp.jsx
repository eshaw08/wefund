import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import "./SignUp.css";
import logo from "../../assets/logo.png";
import backgroundImage from "../../assets/backgroundImage.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidForm()) {
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Update the user's profile with the displayName (user's name)
      await updateProfile(user, {
        displayName: formData.name,
      });

      setSuccessMessage("Sign-up successful!");
      setTimeout(() => {
        navigate("/signin", { state: { email: formData.email, name: formData.name } });
      }, 1000);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please try signing in or use a different email.");
      } else if (error.code === "auth/weak-password") {
        setError("The password is too weak. Please use at least 6 characters.");
      } else {
        setError("Error signing up: " + error.message);
      }
      setSuccessMessage("");
    }
  };

  const isValidForm = () => {
    const { name, email, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  return (
    <div
      className="signin-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div className="signin-card">
        <img src={logo} alt="WeFund logo" className="logo-image" />
        <h1 className="welcome-heading">Sign Up</h1>
        <p className="subtext">Create an account to get started.</p>

        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="signup-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="signup-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="signup-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="signup-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" className="signin-button continue active">
            Sign Up
          </button>
        </form>

        <p className="signup-link">
          Already have an account?{" "}
          <a href="#" onClick={() => navigate("/signin")}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;