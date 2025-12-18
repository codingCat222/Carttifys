const Wallet = require('../../models/Wallet');
const Payout = require('../../models/Payout');
const User = require('../../models/User');
const paymentConfig = require('../../config/payment');

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    const user = await User.findById(userId).select('paymentInfo');

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawn: wallet.totalWithdrawn,
        totalAdminFees: wallet.totalAdminFees,
        bankDetails: wallet.bankDetails || user.paymentInfo,
        lastPayoutDate: wallet.lastPayoutDate
      }
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet',
      error: error.message
    });
  }
};

const requestPayout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, payoutMethod = 'bank' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount required'
      });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const user = await User.findById(userId);
    if (payoutMethod === 'bank' && (!user.paymentInfo.bankName || !user.paymentInfo.accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Bank details not configured'
      });
    }

    const payout = await Payout.create({
      seller: userId,
      wallet: wallet._id,
      amount,
      payoutMethod,
      bankDetails: payoutMethod === 'bank' ? user.paymentInfo : null
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted',
      data: {
        payoutId: payout._id,
        reference: payout.reference,
        amount,
        status: payout.status
      }
    });

  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({
      success: false,
      message: 'Payout request failed',
      error: error.message
    });
  }
};

const getPayoutHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { seller: userId };
    if (status) filter.status = status;

    const payouts = await Payout.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payout.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayouts: total
      }
    });

  } catch (error) {
    console.error('Payout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payout history',
      error: error.message
    });
  }
};

module.exports = { getWallet, requestPayout, getPayoutHistory };