import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import ReCAPTCHA from "react-google-recaptcha";
import { FiShield, FiArrowLeft } from "react-icons/fi";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const { btnLoading, verifyOtp } = UserData();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  function onChange(value) {
    setShow(true);
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    await verifyOtp(Number(otp), navigate);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-icon">
          <FiShield size={36} />
        </div>
        <h2>Verify Your Account</h2>
        
        <p className="auth-description">
          Please enter the verification code sent to your email address.
        </p>
        
        <form onSubmit={submitHandler}>
          <label htmlFor="otp">Verification Code</label>
          <input
            type="number"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the 6-digit code"
            required
          />
          
          <div className="recaptcha-container">
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={onChange}
            />
          </div>
          
          {show ? (
            <button disabled={btnLoading} type="submit" className="common-btn">
              {btnLoading ? "Verifying..." : "Verify Account"}
            </button>
          ) : (
            <button disabled={true} type="button" className="common-btn">
              Please Complete the CAPTCHA
            </button>
          )}
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

export default Verify;
