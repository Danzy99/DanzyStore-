const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// POST: Buat Transaksi Baru (Hanya jika login)
router.post('/checkout', protect, async (req, res) => {
  try {
    const { game, account_id, product, price, payment_method } = req.body;
    
    // Generate Invoice Unik
    const invoice = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const transaction = await Transaction.create({
      invoice,
      user_id: req.user._id,
      game,
      account_id,
      product,
      price,
      payment_method,
      status: 'Pending'
    });

    // TODO: Hit API Tripay/Midtrans di sini untuk mendapatkan URL Bayar / QRIS String
    // const paymentData = await createTripayTransaction(transaction);

    res.status(201).json({
      success: true,
      invoice: transaction.invoice,
      message: 'Transaksi berhasil dibuat, silakan lanjutkan pembayaran.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET: Cek Pesanan (Bisa diakses publik)
router.get('/check/:invoice', async (req, res) => {
  const transaction = await Transaction.findOne({ invoice: req.params.invoice }).populate('user_id', 'username email');
  if (!transaction) return res.status(404).json({ message: 'Invoice tidak ditemukan' });
  res.json(transaction);
});

module.exports = router;
