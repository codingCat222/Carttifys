const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const paymentConfig = require('../config/payment');

const initializePayment = async (req, res) => {
  try {
    const { orderId, email } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      buyer: userId,
      paymentStatus: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or already paid'
      });
    }

    const split = paymentConfig.calculateSplit(order.totalAmount);
    
    const metadata = {
      orderId: order._id,
      buyerId: userId,
      sellerId: order.seller,
      adminFee: split.adminFee,
      sellerAmount: split.sellerAmount
    };

    const paymentResponse = await paymentConfig.initializePayment(
      email,
      order.totalAmount,
      metadata
    );

    const transaction = await Transaction.create({
      reference: paymentResponse.data.reference,
      order: order._id,
      buyer: userId,
      seller: order.seller,
      amount: order.totalAmount,
      adminFee: split.adminFee,
      sellerAmount: split.sellerAmount,
      paymentMethod: 'card',
      status: 'pending',
      metadata
    });

    order.paymentReference = paymentResponse.data.reference;
    order.transaction = transaction._id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized',
      data: {
        authorization_url: paymentResponse.data.authorization_url,
        reference: paymentResponse.data.reference,
        amount: order.totalAmount
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const verification = await paymentConfig.verifyPayment(reference);

    if (verification.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }

    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.status = 'success';
    transaction.paystackResponse = verification.data;
    await transaction.save();

    const order = await Order.findById(transaction.order);
    if (order) {
      order.paymentStatus = 'completed';
      order.paymentReference = reference;
      await order.save();

      let wallet = await Wallet.findOne({ user: transaction.seller });
      if (!wallet) {
        wallet = await Wallet.create({ user: transaction.seller });
      }

      await wallet.addEarnings(transaction.sellerAmount, transaction.adminFee);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order?._id,
        amount: transaction.amount,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

const webhookHandler = async (req, res) => {
  try {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      
      const transaction = await Transaction.findOne({ reference });
      if (transaction && transaction.status === 'pending') {
        transaction.status = 'success';
        transaction.paystackResponse = event.data;
        await transaction.save();

        const order = await Order.findById(transaction.order);
        if (order) {
          order.paymentStatus = 'completed';
          await order.save();

          let wallet = await Wallet.findOne({ user: transaction.seller });
          if (!wallet) {
            wallet = await Wallet.create({ user: transaction.seller });
          }

          await wallet.addEarnings(transaction.sellerAmount, transaction.adminFee);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = { initializePayment, verifyPayment, webhookHandler };