// src/components/BuyerDashboard/Verify.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faCheckCircle, faTimesCircle,
  faPhone, faEnvelope, faIdCard, faShieldAlt,
  faSpinner, faCheck, faTimes, faUpload
} from '@fortawesome/free-solid-svg-icons';
import './Verify.css';

const Verify = ({ userProfile, navigate, setActiveSection }) => {
  const [verificationStep, setVerificationStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(userProfile.phoneVerified || false);
  const [emailVerified, setEmailVerified] = useState(userProfile.emailVerified || false);
  const [idVerified, setIdVerified] = useState(userProfile.idVerified || false);
  const [otp, setOtp] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [idImage, setIdImage] = useState(null);

  const verificationSteps = [
    { id: 1, title: 'Phone Verification', icon: faPhone, verified: phoneVerified },
    { id: 2, title: 'Email Verification', icon: faEnvelope, verified: emailVerified },
    { id: 3, title: 'ID Verification', icon: faIdCard, verified: idVerified },
  ];

  const handleSendOTP = async (type) => {
    // Send OTP logic here
    console.log(`Sending ${type} OTP...`);
  };

  const handleVerifyOTP = async (type) => {
    // Verify OTP logic here
    console.log(`Verifying ${type} OTP...`);
    if (type === 'phone') {
      setPhoneVerified(true);
    } else if (type === 'email') {
      setEmailVerified(true);
    }
    if (verificationStep < 3) {
      setVerificationStep(verificationStep + 1);
    }
  };

  const handleUploadID = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingId(true);
      // Upload logic here
      setTimeout(() => {
        setIdImage(URL.createObjectURL(file));
        setIdVerified(true);
        setUploadingId(false);
      }, 2000);
    }
  };

  const calculateVerificationScore = () => {
    let score = 0;
    if (phoneVerified) score += 33;
    if (emailVerified) score += 33;
    if (idVerified) score += 34;
    return score;
  };

  const getVerificationLevel = () => {
    const score = calculateVerificationScore();
    if (score === 0) return 'Unverified';
    if (score < 70) return 'Basic';
    if (score < 100) return 'Advanced';
    return 'Full';
  };

  return (
    <div className="verify-page">
      <div className="verify-header">
        <button onClick={() => setActiveSection('profile')}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Account Verification</h2>
        <div></div>
      </div>

      <div className="verification-progress">
        <div className="progress-header">
          <div className="progress-title">
            <FontAwesomeIcon icon={faShieldAlt} />
            <h3>Verification Status</h3>
          </div>
          <div className={`verification-level ${getVerificationLevel().toLowerCase()}`}>
            {getVerificationLevel()}
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${calculateVerificationScore()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          <span>Verification Score: {calculateVerificationScore()}%</span>
          <span>{getVerificationLevel()} Account</span>
        </div>
      </div>

      <div className="verification-steps">
        {verificationSteps.map((step) => (
          <div 
            key={step.id} 
            className={`verification-step ${step.verified ? 'completed' : ''} ${verificationStep === step.id ? 'active' : ''}`}
            onClick={() => !step.verified && setVerificationStep(step.id)}
          >
            <div className="step-header">
              <div className="step-icon">
                <FontAwesomeIcon icon={step.icon} />
              </div>
              <div className="step-info">
                <h4>{step.title}</h4>
                <p>{step.verified ? 'Verified' : 'Not Verified'}</p>
              </div>
              <div className="step-status">
                {step.verified ? (
                  <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" />
                ) : (
                  <FontAwesomeIcon icon={faTimesCircle} className="unverified-icon" />
                )}
              </div>
            </div>
            
            {verificationStep === step.id && !step.verified && (
              <div className="step-content">
                {step.id === 1 && (
                  <div className="phone-verification">
                    <p>Verify your phone number to secure your account</p>
                    <div className="phone-input-section">
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        defaultValue={userProfile.phone || ''}
                        className="phone-input"
                      />
                      <button 
                        className="send-otp-btn"
                        onClick={() => handleSendOTP('phone')}
                      >
                        Send OTP
                      </button>
                    </div>
                    <div className="otp-input-section">
                      <input 
                        type="text" 
                        placeholder="Enter OTP" 
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="otp-input"
                      />
                      <button 
                        className="verify-otp-btn"
                        onClick={() => handleVerifyOTP('phone')}
                        disabled={otp.length !== 6}
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}
                
                {step.id === 2 && (
                  <div className="email-verification">
                    <p>Verify your email address for notifications</p>
                    <div className="email-display">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{userProfile.email || 'No email provided'}</span>
                    </div>
                    <div className="email-actions">
                      <button 
                        className="send-email-btn"
                        onClick={() => handleSendOTP('email')}
                      >
                        Send Verification Email
                      </button>
                      <button 
                        className="verify-email-btn"
                        onClick={() => handleVerifyOTP('email')}
                      >
                        Verify Email
                      </button>
                    </div>
                  </div>
                )}
                
                {step.id === 3 && (
                  <div className="id-verification">
                    <p>Upload a valid ID for enhanced security</p>
                    <div className="id-upload-section">
                      {idImage ? (
                        <div className="id-preview">
                          <img src={idImage} alt="ID Preview" />
                          <button className="change-id-btn" onClick={() => setIdImage(null)}>
                            Change
                          </button>
                        </div>
                      ) : (
                        <label className="id-upload-area">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleUploadID}
                            className="id-input"
                          />
                          <FontAwesomeIcon icon={faUpload} />
                          <p>Upload Government ID</p>
                          <span>PNG, JPG up to 5MB</span>
                        </label>
                      )}
                      {uploadingId && (
                        <div className="uploading-overlay">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <p>Uploading...</p>
                        </div>
                      )}
                    </div>
                    <div className="id-requirements">
                      <h5>Accepted IDs:</h5>
                      <ul>
                        <li>National ID Card</li>
                        <li>International Passport</li>
                        <li>Driver's License</li>
                        <li>Voter's Card</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="verification-benefits">
        <h3>Benefits of Verification</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <FontAwesomeIcon icon={faShieldAlt} />
            <h4>Enhanced Security</h4>
            <p>Protect your account from unauthorized access</p>
          </div>
          <div className="benefit-card">
            <FontAwesomeIcon icon={faCheckCircle} />
            <h4>Trust Badge</h4>
            <p>Build trust with sellers and buyers</p>
          </div>
          <div className="benefit-card">
            <FontAwesomeIcon icon={faIdCard} />
            <h4>Higher Limits</h4>
            <p>Increased transaction and withdrawal limits</p>
          </div>
        </div>
      </div>

      <div className="verification-footer">
        <p>
          <FontAwesomeIcon icon={faShieldAlt} />
          Your information is secure and encrypted
        </p>
        <button 
          className="continue-shopping-btn"
          onClick={() => setActiveSection('home')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Verify;