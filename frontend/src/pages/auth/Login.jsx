import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { CourseData } from "../../context/CourseContext";
import { FiUser, FiLock, FiLogIn } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { btnLoading, loginUser } = UserData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { fetchMyCourse } = CourseData();

  const submitHandler = async (e) => {
    e.preventDefault();
    await loginUser(email, password, navigate, fetchMyCourse);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-icon">
          <FiUser size={36} />
        </div>
        
        <h2>Welcome Back</h2>
        
        <p className="auth-description">
          Sign in to access your account and continue learning
        </p>
        
        <form onSubmit={submitHandler}>
          <label htmlFor="email">Email Address</label>
          <div className="input-group">
            <FiUser className="input-icon" />
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button disabled={btnLoading} type="submit" className="common-btn">
            {btnLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
          <p>
            <Link to="/forgot">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
