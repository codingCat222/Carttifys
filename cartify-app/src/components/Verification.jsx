import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../services/Api';
import './Verification.css';

const Verification = () => {
  const [verificationData, setVerificationData] = useState({
    level: 'basic',
    steps: [],
    documents: {},
    bvnStatus: 'pending',
    idStatus: 'pending',
    bankStatus: 'pending',
    businessStatus: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    bvn: '',
    idType: 'nin',
    idNumber: '',
    idFront: null,
    idBack: null,
    bankName: '',
    accountNumber: '',
    accountName: '',
    businessName: '',
    businessType: '',
    rcNumber: '',
    taxId: ''
  });

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getVerificationStatus();
      if (response?.success) {
        setVerificationData(response.data);
        // Determine active step
        const steps = response.data.steps || [];
        const currentStep = steps.findIndex(step => !step.completed);
        setActiveStep(currentStep >= 0 ? currentStep : steps.length - 1);
      }
    } catch (error) {
      console.error('Failed to fetch verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificationSteps = [
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your email address',
      icon: 'fas fa-envelope',
      required: true
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your phone number',
      icon: 'fas fa-phone',
      required: true
    },
    {
      id: 'bvn',
      title: 'BVN Verification',
      description: 'Verify your Bank Verification Number',
      icon: 'fas fa-id-card',
      required: true
    },
    {
      id: 'id',
      title: 'ID Verification',
      description: 'Upload government-issued ID',
      icon: 'fas fa-passport',
      required: true
    },
    {
      id: 'bank',
      title: 'Bank Account',
      description: 'Add and verify bank account',
      icon: 'fas fa-university',
      required: true
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Business registration documents',
      icon: 'fas fa-briefcase',
      required: false
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { class: 'status-verified', label: 'Verified', icon: 'fas fa-check-circle' },
      pending: { class: 'status-pending', label: 'Pending', icon: 'fas fa-clock' },
      submitted: { class: 'status-submitted', label: 'Under Review', icon: 'fas fa-hourglass-half' },
      rejected: { class: 'status-rejected', label: 'Rejected', icon: 'fas fa-times-circle' },
      required: { class: 'status-required', label: 'Required', icon: 'fas fa-exclamation-circle' }
    };
    
    const config = statusConfig[status] || { class: 'status-default', label: status, icon: 'fas fa-question' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={config.icon}></i> {config.label}
      </span>
    );
  };

  const handleFileUpload = async (file, documentType) => {
    try {
      setUploading(true);
      const response = await sellerAPI.uploadVerificationDocument(file, documentType);
      if (response?.success) {
        fetchVerificationData();
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  const submitBVN = async () => {
    if (!formData.bvn || formData.bvn.length !== 11) {
      alert('Please enter a valid 11-digit BVN');
      return;
    }
    
    try {
      setUploading(true);
      const response = await sellerAPI.submitBVN(formData.bvn);
      if (response?.success) {
        fetchVerificationData();
      }
    } catch (error) {
      console.error('Failed to submit BVN:', error);
    } finally {
      setUploading(false);
    }
  };

  const submitID = async () => {
    if (!formData.idNumber || !formData.idFront) {
      alert('Please provide ID number and front image');
      return;
    }
    
    try {
      setUploading(true);
      const response = await sellerAPI.submitID({
        type: formData.idType,
        number: formData.idNumber,
        frontImage: formData.idFront,
        backImage: formData.idBack
      });
      if (response?.success) {
        fetchVerificationData();
      }
    } catch (error) {
      console.error('Failed to submit ID:', error);
    } finally {
      setUploading(false);
    }
  };

  const submitBankDetails = async () => {
    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      alert('Please fill all bank details');
      return;
    }
    
    try {
      setUploading(true);
      const response = await sellerAPI.submitBankDetails({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName
      });
      if (response?.success) {
        fetchVerificationData();
      }
    } catch (error) {
      console.error('Failed to submit bank details:', error);
    } finally {
      setUploading(false);
    }
  };

  const nigerianBanks = [
    'Access Bank',
    'First Bank of Nigeria',
    'Guaranty Trust Bank (GTB)',
    'Zenith Bank',
    'United Bank for Africa (UBA)',
    'Fidelity Bank',
    'Union Bank',
    'Stanbic IBTC Bank',
    'Ecobank Nigeria',
    'Sterling Bank',
    'Wema Bank',
    'Polaris Bank',
    'Keystone Bank',
    'Unity Bank',
    'Heritage Bank',
    'Jaiz Bank',
    'SunTrust Bank',
    'Providus Bank'
  ];

  return (
    <div className="verification-page">
      <div className="page-header">
        <h1>Account Verification</h1>
        <div className="verification-level">
          <span className={`level-badge level-${verificationData.level}`}>
            {verificationData.level.charAt(0).toUpperCase() + verificationData.level.slice(1)} Level
          </span>
        </div>
      </div>

      {/* Verification Progress */}
      <div className="verification-progress-section">
        <h2>Verification Progress</h2>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(activeStep / verificationSteps.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{activeStep}</span>
              <span className="stat-label">Steps Completed</span>
            </div>
            <div className="stat">
              <span className="stat-value">{verificationSteps.length}</span>
              <span className="stat-label">Total Steps</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {Math.round((activeStep / verificationSteps.length) * 100)}%
              </span>
              <span className="stat-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="verification-steps">
        {verificationSteps.map((step, index) => {
          const stepData = verificationData.steps?.find(s => s.id === step.id) || {};
          const isCompleted = stepData.status === 'verified' || stepData.completed;
          const isCurrent = index === activeStep;
          
          return (
            <div 
              key={step.id} 
              className={`step-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => setActiveStep(index)}
            >
              <div className="step-header">
                <div className="step-icon">
                  <i className={step.icon}></i>
                </div>
                <div className="step-info">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="step-status">
                  {isCompleted ? (
                    <span className="status-completed">
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  ) : isCurrent ? (
                    <span className="status-current">
                      <i className="fas fa-pencil-alt"></i> In Progress
                    </span>
                  ) : (
                    <span className="status-pending">
                      <i className="fas fa-clock"></i> Pending
                    </span>
                  )}
                </div>
              </div>
              
              {isCurrent && (
                <div className="step-content">
                  {/* Email Verification */}
                  {step.id === 'email' && (
                    <div className="verification-form">
                      <div className="form-group">
                        <label>Email Address</label>
                        <div className="email-display">
                          <i className="fas fa-envelope"></i>
                          <span>your-email@example.com</span>
                        </div>
                        <p className="form-help">A verification link has been sent to your email</p>
                      </div>
                      <button className="btn-resend">
                        <i className="fas fa-paper-plane"></i> Resend Verification Email
                      </button>
                    </div>
                  )}

                  {/* Phone Verification */}
                  {step.id === 'phone' && (
                    <div className="verification-form">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <div className="phone-display">
                          <i className="fas fa-phone"></i>
                          <span>+234 *** *** ****</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Enter Verification Code</label>
                        <div className="otp-inputs">
                          {[1,2,3,4,5,6].map((digit) => (
                            <input
                              key={digit}
                              type="text"
                              maxLength="1"
                              className="otp-digit"
                            />
                          ))}
                        </div>
                      </div>
                      <button className="btn-verify-phone">
                        <i className="fas fa-check-circle"></i> Verify Phone
                      </button>
                    </div>
                  )}

                  {/* BVN Verification */}
                  {step.id === 'bvn' && (
                    <div className="verification-form">
                      <div className="form-group">
                        <label>Bank Verification Number (BVN)</label>
                        <input
                          type="text"
                          value={formData.bvn}
                          onChange={(e) => setFormData({...formData, bvn: e.target.value})}
                          placeholder="Enter 11-digit BVN"
                          maxLength="11"
                        />
                        <p className="form-help">
                          <i className="fas fa-info-circle"></i> 
                          Your BVN is required for identity verification and secure transactions
                        </p>
                      </div>
                      
                      <div className="bvn-info-card">
                        <div className="info-header">
                          <i className="fas fa-shield-alt"></i>
                          <h4>Why we need your BVN</h4>
                        </div>
                        <ul className="info-list">
                          <li><i className="fas fa-check"></i> Identity verification</li>
                          <li><i className="fas fa-check"></i> Secure transactions</li>
                          <li><i className="fas fa-check"></i> Fraud prevention</li>
                          <li><i className="fas fa-check"></i> Regulatory compliance</li>
                        </ul>
                        <div className="security-notice">
                          <i className="fas fa-lock"></i>
                          <p>Your BVN is securely encrypted and stored</p>
                        </div>
                      </div>
                      
                      <button 
                        className="btn-submit-bvn" 
                        onClick={submitBVN}
                        disabled={uploading || !formData.bvn || formData.bvn.length !== 11}
                      >
                        {uploading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Verifying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-id-card"></i> Verify BVN
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ID Verification */}
                  {step.id === 'id' && (
                    <div className="verification-form">
                      <div className="form-group">
                        <label>ID Type</label>
                        <select
                          value={formData.idType}
                          onChange={(e) => setFormData({...formData, idType: e.target.value})}
                        >
                          <option value="nin">National Identity Number (NIN)</option>
                          <option value="passport">International Passport</option>
                          <option value="driver">Driver's License</option>
                          <option value="voter">Voter's Card</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>ID Number</label>
                        <input
                          type="text"
                          value={formData.idNumber}
                          onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                          placeholder="Enter ID number"
                        />
                      </div>
                      
                      <div className="upload-section">
                        <div className="upload-group">
                          <label>Front of ID</label>
                          <div className="upload-area">
                            <i className="fas fa-camera"></i>
                            <p>Upload clear image of ID front</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFormData({...formData, idFront: e.target.files[0]})}
                            />
                          </div>
                        </div>
                        
                        <div className="upload-group">
                          <label>Back of ID (Optional)</label>
                          <div className="upload-area">
                            <i className="fas fa-camera"></i>
                            <p>Upload clear image of ID back</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFormData({...formData, idBack: e.target.files[0]})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="upload-requirements">
                        <h4><i className="fas fa-clipboard-check"></i> Requirements:</h4>
                        <ul>
                          <li>Clear, readable image</li>
                          <li>All corners visible</li>
                          <li>Good lighting</li>
                          <li>File size under 5MB</li>
                          <li>JPG, PNG, or PDF format</li>
                        </ul>
                      </div>
                      
                      <button 
                        className="btn-submit-id" 
                        onClick={submitID}
                        disabled={uploading || !formData.idNumber || !formData.idFront}
                      >
                        {uploading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload"></i> Submit ID Verification
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bank Account Verification */}
                  {step.id === 'bank' && (
                    <div className="verification-form">
                      <div className="form-group">
                        <label>Bank Name</label>
                        <select
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        >
                          <option value="">Select Bank</option>
                          {nigerianBanks.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Account Number</label>
                        <input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          placeholder="10-digit account number"
                          maxLength="10"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Account Name</label>
                        <input
                          type="text"
                          value={formData.accountName}
                          onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                          placeholder="As shown on bank statement"
                        />
                      </div>
                      
                      <div className="bank-verification-note">
                        <i className="fas fa-info-circle"></i>
                        <p>
                          We'll send a small test deposit (₦10 or less) to verify your account. 
                          This will be refunded to your account balance.
                        </p>
                      </div>
                      
                      <button 
                        className="btn-submit-bank" 
                        onClick={submitBankDetails}
                        disabled={uploading || !formData.bankName || !formData.accountNumber || !formData.accountName}
                      >
                        {uploading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Verifying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-university"></i> Verify Bank Account
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Business Verification */}
                  {step.id === 'business' && (
                    <div className="verification-form">
                      <div className="form-group">
                        <label>Business Name</label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                          placeholder="Registered business name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Business Type</label>
                        <select
                          value={formData.businessType}
                          onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        >
                          <option value="">Select business type</option>
                          <option value="sole">Sole Proprietorship</option>
                          <option value="llc">Limited Liability Company (LLC)</option>
                          <option value="partnership">Partnership</option>
                          <option value="ngo">NGO/Non-profit</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>RC Number (Optional)</label>
                        <input
                          type="text"
                          value={formData.rcNumber}
                          onChange={(e) => setFormData({...formData, rcNumber: e.target.value})}
                          placeholder="If registered with CAC"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>TIN (Optional)</label>
                        <input
                          type="text"
                          value={formData.taxId}
                          onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                          placeholder="Tax Identification Number"
                        />
                      </div>
                      
                      <div className="upload-section">
                        <div className="upload-group">
                          <label>CAC Certificate (Optional)</label>
                          <div className="upload-area">
                            <i className="fas fa-file-pdf"></i>
                            <p>Upload CAC registration document</p>
                            <input type="file" accept=".pdf,.jpg,.png" />
                          </div>
                        </div>
                      </div>
                      
                      <button className="btn-submit-business">
                        <i className="fas fa-save"></i> Save Business Details
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verification Benefits */}
      <div className="verification-benefits">
        <h2>Benefits of Full Verification</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <h3>Higher Withdrawal Limits</h3>
            <p>Unlock unlimited withdrawal amounts</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Enhanced Security</h3>
            <p>Protect your account from unauthorized access</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-star"></i>
            </div>
            <h3>Buyer Trust</h3>
            <p>Verified badge builds customer confidence</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <h3>Faster Payouts</h3>
            <p>Quick withdrawal processing times</p>
          </div>
        </div>
      </div>

      {/* Verification Status Summary */}
      <div className="status-summary">
        <h2>Verification Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-header">
              <h4>Email Verification</h4>
              {getStatusBadge(verificationData.steps?.find(s => s.id === 'email')?.status || 'pending')}
            </div>
            <p>Required for account security</p>
          </div>
          
          <div className="status-item">
            <div className="status-header">
              <h4>Phone Verification</h4>
              {getStatusBadge(verificationData.steps?.find(s => s.id === 'phone')?.status || 'pending')}
            </div>
            <p>Required for account security</p>
          </div>
          
          <div className="status-item">
            <div className="status-header">
              <h4>BVN Verification</h4>
              {getStatusBadge(verificationData.bvnStatus)}
            </div>
            <p>Required for Nigerian sellers</p>
          </div>
          
          <div className="status-item">
            <div className="status-header">
              <h4>ID Verification</h4>
              {getStatusBadge(verificationData.idStatus)}
            </div>
            <p>Government-issued ID required</p>
          </div>
          
          <div className="status-item">
            <div className="status-header">
              <h4>Bank Verification</h4>
              {getStatusBadge(verificationData.bankStatus)}
            </div>
            <p>Required for withdrawals</p>
          </div>
          
          <div className="status-item">
            <div className="status-header">
              <h4>Business Verification</h4>
              {getStatusBadge(verificationData.businessStatus)}
            </div>
            <p>Optional for business accounts</p>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="verification-support">
        <div className="support-card">
          <div className="support-icon">
            <i className="fas fa-headset"></i>
          </div>
          <div className="support-content">
            <h3>Need Help with Verification?</h3>
            <p>Our support team is here to help you complete the verification process</p>
          </div>
          <button className="btn-contact-support">
            <i className="fas fa-envelope"></i> Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verification;