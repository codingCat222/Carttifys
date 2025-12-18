const Paystack = require('paystack-api');

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

const paymentConfig = {
  adminPercentage: 0.05,
  sellerPercentage: 0.95,
  
  calculateSplit: (amount) => {
    const adminFee = amount * paymentConfig.adminPercentage;
    const sellerAmount = amount * paymentConfig.sellerPercentage;
    return {
      total: amount,
      adminFee: parseFloat(adminFee.toFixed(2)),
      sellerAmount: parseFloat(sellerAmount.toFixed(2))
    };
  },
  
  initializePayment: async (email, amount, metadata = {}) => {
    try {
      const response = await paystack.transaction.initialize({
        email,
        amount: amount * 100,
        metadata
      });
      return response;
    } catch (error) {
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  },
  
  verifyPayment: async (reference) => {
    try {
      const response = await paystack.transaction.verify({ reference });
      return response;
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  },
  
  transferToSeller: async (recipient, amount, reason) => {
    try {
      const response = await paystack.transfer.create({
        source: 'balance',
        amount: amount * 100,
        recipient,
        reason
      });
      return response;
    } catch (error) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }
};

module.exports = paymentConfig;