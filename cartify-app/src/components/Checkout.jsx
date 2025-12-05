import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Checkout.css';
import {
  faShoppingCart,
  faTruck,
  faCreditCard,
  faFileAlt,
  faArrowLeft,
  faArrowRight,
  faLock,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faGift,
  faShieldAlt,
  faUser,
  faMapMarkerAlt,
  faPhone,
  faCity,
  faEnvelope,
  faCalendarAlt,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Shipping Information
    shippingAddress: currentUser?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    
    // Payment Method
    paymentMethod: 'card',
    
    // Card Details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    
    // Billing Address (if different)
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    
    // Order Notes
    orderNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState('shipping');

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.00;
  const tax = subtotal * 0.08;
  const commission = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'sameAsShipping' && checked) {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.shippingAddress,
        billingCity: prev.city,
        billingState: prev.state,
        billingZipCode: prev.zipCode
      }));
    }
  };

  const validateForm = (step) => {
    const errors = {};

    if (step === 'shipping') {
      if (!formData.shippingAddress.trim()) errors.shippingAddress = 'Shipping address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    }

    if (step === 'payment') {
      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length !== 16) {
          errors.cardNumber = 'Valid card number is required';
        }
        if (!formData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          errors.expiryDate = 'Valid expiry date (MM/YY) is required';
        }
        if (!formData.cvv.trim() || formData.cvv.length !== 3) {
          errors.cvv = 'Valid CVV is required';
        }
        if (!formData.nameOnCard.trim()) errors.nameOnCard = 'Name on card is required';
      }

      if (!formData.sameAsShipping) {
        if (!formData.billingAddress.trim()) errors.billingAddress = 'Billing address is required';
        if (!formData.billingCity.trim()) errors.billingCity = 'Billing city is required';
        if (!formData.billingState.trim()) errors.billingState = 'Billing state is required';
        if (!formData.billingZipCode.trim()) errors.billingZipCode = 'Billing ZIP code is required';
      }
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateForm(activeStep);
    
    if (Object.keys(errors).length === 0) {
      if (activeStep === 'shipping') setActiveStep('payment');
      else if (activeStep === 'payment') setActiveStep('review');
    } else {
      alert('Please fix the form errors before proceeding.');
      console.log('Form errors:', errors);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep === 'payment') setActiveStep('shipping');
    else if (activeStep === 'review') setActiveStep('payment');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const order = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        items: cartItems,
        total: total,
        shipping: formData,
        status: 'processing',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      console.log('Order created:', order);
      alert(`Payment successful! Your order #${order.id} has been placed.`);
      
      clearCart();
      navigate('/buyer/orders', { 
        state: { 
          message: `Order #${order.id} placed successfully!`,
          orderId: order.id
        }
      });
    } catch (error) {
      alert('Payment failed. Please try again.');
      console.error('Payment error:', error);
    }
    
    setLoading(false);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card py-5">
              <FontAwesomeIcon icon={faShoppingCart} className="text-muted mb-3" size="3x" />
              <h3>Your cart is empty</h3>
              <p className="text-muted mb-4">Add some products to proceed to checkout</p>
              <Link to="/buyer/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1>Checkout </h1>
          <p className="text-muted">Complete your purchase securely</p>
        </div>
      </div>

      {/* Checkout Steps */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className={`text-center flex-fill ${activeStep === 'shipping' ? 'text-primary' : 'text-muted'}`}>
                  <div className={`step-circle ${activeStep === 'shipping' ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faTruck} />
                  </div>
                  <div className="mt-2">Shipping</div>
                </div>
                <div className="flex-fill">
                  <div className="progress" style={{height: '2px'}}>
                    <div className="progress-bar" style={{width: activeStep === 'shipping' ? '0%' : '100%'}}></div>
                  </div>
                </div>
                <div className={`text-center flex-fill ${activeStep === 'payment' ? 'text-primary' : activeStep === 'review' ? 'text-primary' : 'text-muted'}`}>
                  <div className={`step-circle ${activeStep === 'payment' || activeStep === 'review' ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faCreditCard} />
                  </div>
                  <div className="mt-2">Payment</div>
                </div>
                <div className="flex-fill">
                  <div className="progress" style={{height: '2px'}}>
                    <div className="progress-bar" style={{width: activeStep === 'review' ? '100%' : '0%'}}></div>
                  </div>
                </div>
                <div className={`text-center flex-fill ${activeStep === 'review' ? 'text-primary' : 'text-muted'}`}>
                  <div className={`step-circle ${activeStep === 'review' ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faFileAlt} />
                  </div>
                  <div className="mt-2">Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Shipping Information */}
            {activeStep === 'shipping' && (
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h4 className="mb-0">
                    <FontAwesomeIcon icon={faTruck} className="me-2" />
                    Shipping Information
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="shippingAddress" className="form-label">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                          Shipping Address *
                        </label>
                        <textarea
                          className="form-control"
                          id="shippingAddress"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          required
                          rows="3"
                          placeholder="Enter your complete shipping address"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="city" className="form-label">
                          <FontAwesomeIcon icon={faCity} className="me-2" />
                          City *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="state" className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="zipCode" className="form-label">ZIP Code *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="orderNotes" className="form-label">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Order Notes (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="orderNotes"
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Special delivery instructions or notes about your order..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {activeStep === 'payment' && (
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h4 className="mb-0">
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                    Payment Method
                  </h4>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <label className="form-label fw-bold">Select Payment Method *</label>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-check card h-100 payment-method-card">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={handleChange}
                            id="paymentCard"
                          />
                          <label className="form-check-label card-body text-center" htmlFor="paymentCard">
                            <FontAwesomeIcon icon={faCreditCard} className="payment-icon mb-2" />
                            <div>Credit/Debit Card</div>
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check card h-100 payment-method-card">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            value="paystack"
                            checked={formData.paymentMethod === 'paystack'}
                            onChange={handleChange}
                            id="paymentPaystack"
                          />
                          <label className="form-check-label card-body text-center" htmlFor="paymentPaystack">
                            <FontAwesomeIcon icon={faIdCard} className="payment-icon mb-2" />
                            <div>Paystack</div>
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check card h-100 payment-method-card">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            value="flutterwave"
                            checked={formData.paymentMethod === 'flutterwave'}
                            onChange={handleChange}
                            id="paymentFlutterwave"
                          />
                          <label className="form-check-label card-body text-center" htmlFor="paymentFlutterwave">
                            <FontAwesomeIcon icon={faCreditCard} className="payment-icon mb-2" />
                            <div>Flutterwave</div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <label htmlFor="cardNumber" className="form-label">Card Number *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="cardNumber"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                setFormData(prev => ({ ...prev, cardNumber: formatted }));
                              }}
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label htmlFor="nameOnCard" className="form-label">
                              <FontAwesomeIcon icon={faUser} className="me-2" />
                              Name on Card *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="nameOnCard"
                              name="nameOnCard"
                              value={formData.nameOnCard}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="expiryDate" className="form-label">
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                              Expiry Date *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="expiryDate"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="cvv" className="form-label">CVV *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              placeholder="123"
                              maxLength="3"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {(formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave') && (
                    <div className="alert alert-info">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      <strong>Secure Payment:</strong> You will be redirected to {formData.paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'} to complete your payment securely.
                    </div>
                  )}

                  {/* Billing Address */}
                  <div className="mt-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={handleChange}
                        id="sameAsShipping"
                      />
                      <label className="form-check-label" htmlFor="sameAsShipping">
                        Billing address same as shipping address
                      </label>
                    </div>

                    {!formData.sameAsShipping && (
                      <div className="border rounded p-3">
                        <h6>Billing Address</h6>
                        <div className="row">
                          <div className="col-12">
                            <div className="mb-3">
                              <label htmlFor="billingAddress" className="form-label">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                Billing Address *
                              </label>
                              <textarea
                                className="form-control"
                                id="billingAddress"
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleChange}
                                required
                                rows="2"
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label htmlFor="billingCity" className="form-label">City *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="billingCity"
                                name="billingCity"
                                value={formData.billingCity}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label htmlFor="billingState" className="form-label">State *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="billingState"
                                name="billingState"
                                value={formData.billingState}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label htmlFor="billingZipCode" className="form-label">ZIP Code *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="billingZipCode"
                                name="billingZipCode"
                                value={formData.billingZipCode}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {activeStep === 'review' && (
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h4 className="mb-0">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Review Your Order
                  </h4>
                </div>
                <div className="card-body">
                  {/* Shipping Information Review */}
                  <div className="mb-4">
                    <h6>
                      <FontAwesomeIcon icon={faTruck} className="me-2" />
                      Shipping Information
                    </h6>
                    <div className="border rounded p-3">
                      <p className="mb-1"><strong>Address:</strong> {formData.shippingAddress}</p>
                      <p className="mb-1"><strong>City:</strong> {formData.city}, {formData.state} {formData.zipCode}</p>
                      <p className="mb-0"><strong>Phone:</strong> {formData.phone}</p>
                      {formData.orderNotes && (
                        <p className="mb-0 mt-2"><strong>Notes:</strong> {formData.orderNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Information Review */}
                  <div className="mb-4">
                    <h6>
                      <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                      Payment Method
                    </h6>
                    <div className="border rounded p-3">
                      <p className="mb-1"><strong>Method:</strong> 
                        {formData.paymentMethod === 'card' && ' Credit/Debit Card'}
                        {formData.paymentMethod === 'paystack' && ' Paystack'}
                        {formData.paymentMethod === 'flutterwave' && ' Flutterwave'}
                      </p>
                      {formData.paymentMethod === 'card' && (
                        <>
                          <p className="mb-1"><strong>Card:</strong> **** **** **** {formData.cardNumber.slice(-4)}</p>
                          <p className="mb-0"><strong>Name:</strong> {formData.nameOnCard}</p>
                        </>
                      )}
                      {!formData.sameAsShipping && (
                        <p className="mb-0 mt-2"><strong>Billing Address:</strong> {formData.billingAddress}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h6>
                      <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                      Order Items
                    </h6>
                    <div className="border rounded p-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="row align-items-center border-bottom pb-2 mb-2">
                          <div className="col-2">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="img-fluid rounded"
                              style={{width: '50px', height: '50px', objectFit: 'cover'}}
                            />
                          </div>
                          <div className="col-6">
                            <h6 className="mb-1">{item.name}</h6>
                            <small className="text-muted">Seller: {item.seller}</small>
                          </div>
                          <div className="col-2 text-center">
                            <small>Qty: {item.quantity}</small>
                          </div>
                          <div className="col-2 text-end">
                            <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      required
                      id="termsAgreement"
                    />
                    <label className="form-check-label" htmlFor="termsAgreement">
                      I agree to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between">
              {activeStep !== 'shipping' && (
                <button 
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handlePreviousStep}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Previous
                </button>
              )}
              
              {activeStep !== 'review' ? (
                <button 
                  type="button"
                  className="btn btn-primary ms-auto"
                  onClick={handleNextStep}
                >
                  Continue to {activeStep === 'shipping' ? 'Payment' : 'Review'}
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </button>
              ) : (
                <button 
                  type="submit"
                  className="btn btn-success btn-lg ms-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="me-2" />
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top checkout-summary">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                Order Summary
              </h5>
            </div>
            <div className="card-body">
              {/* Cart Items */}
              <div className="mb-3 cart-items-scroll">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div>
                        <div className="fw-semibold small">{item.name}</div>
                        <small className="text-muted">Qty: {item.quantity} × ${item.price}</small>
                      </div>
                      <div className="fw-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="mb-2 pricing-breakdown">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shipping:</span>
                  <span className={shipping === 0 ? 'text-success' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between text-danger small commission-fee">
                  <span>Platform Commission (5%):</span>
                  <span>-${commission.toFixed(2)}</span>
                </div>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3 total-amount">
                <strong>Total:</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>

              {shipping === 0 ? (
                <div className="alert alert-success small mb-3 free-shipping-alert">
                  <FontAwesomeIcon icon={faGift} className="me-2" />
                  🎉 You qualify for free shipping!
                </div>
              ) : (
                <div className="alert alert-info small mb-3 shipping-alert">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </div>
              )}

              <div className="alert alert-warning small commission-alert">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>Note:</strong> 5% platform commission supports marketplace operations and seller services.
              </div>

              {/* Security Badge */}
              <div className="text-center mt-3 security-badge">
                <FontAwesomeIcon icon={faShieldAlt} className="text-muted mb-2" size="lg" />
                <div className="text-muted small">
                  <div>Secure Checkout</div>
                  <div>Your payment information is encrypted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;