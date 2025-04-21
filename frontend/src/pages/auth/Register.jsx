import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { FiUserPlus, FiUser, FiMail, FiLock } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const { btnLoading, registerUser } = UserData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    await registerUser(name, email, password, navigate);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-icon">
          <FiUserPlus size={36} />
        </div>
        
        <h2>Create Account</h2>
        
        <p className="auth-description">
          Join our learning platform to access all courses and resources
        </p>
        
        <form onSubmit={submitHandler}>
          <label htmlFor="name">Full Name</label>
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <label htmlFor="email">Email Address</label>
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />
          </div>

          <button type="submit" disabled={btnLoading} className="common-btn">
            {btnLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
