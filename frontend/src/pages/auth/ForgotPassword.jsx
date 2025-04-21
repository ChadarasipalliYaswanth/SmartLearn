import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";
import { FiMail, FiArrowLeft, FiLock } from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/user/forgot`, { email });

      toast.success(data.message);
      navigate("/login");
      setBtnLoading(false);
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-icon">
          <FiLock size={36} />
        </div>
        
        <h2>Reset Password</h2>
        
        <p className="auth-description">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
          </div>
          
          <button disabled={btnLoading} type="submit" className="common-btn">
            {btnLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <p>
          <Link to="/login" className="back-link">
            <FiArrowLeft size={14} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
