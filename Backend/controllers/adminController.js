const Payout = require('../models/Payout');
const Wallet = require('../models/Wallet');
const paymentConfig = require('../config/payment');

const getPayoutRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const payouts = await Payout.find(filter)
      .populate('seller', 'name email businessName')
      .populate('wallet')
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
    console.error('Get payout requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payout requests',
      error: error.message
    });
  }
};

const processPayout = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payout = await Payout.findById(id)
      .populate('seller')
      .populate('wallet');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout already processed'
      });
    }

    payout.status = 'processing';
    await payout.save();

    try {
      if (payout.payoutMethod === 'bank') {
        const transferResponse = await paymentConfig.transferToSeller(
          payout.seller.paymentInfo.recipientCode,
          payout.amount,
          `Payout for seller: ${payout.seller.businessName}`
        );

        payout.paystackTransferReference = transferResponse.data.reference;
        payout.paystackResponse = transferResponse.data;
        payout.status = 'completed';
        payout.processedAt = new Date();
        payout.completedAt = new Date();
        
        await payout.wallet.withdraw(payout.amount);
      }

      await payout.save();

      res.status(200).json({
        success: true,
        message: 'Payout processed successfully',
        data: payout
      });
    } catch (transferError) {
      payout.status = 'failed';
      payout.adminNotes = transferError.message;
      await payout.save();

      res.status(500).json({
        success: false,
        message: 'Payout processing failed',
        error: transferError.message
      });
    }
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payout',
      error: error.message
    });
  }
};

module.exports = { getPayoutRequests, processPayout };