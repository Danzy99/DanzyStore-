const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

// Endpoint ini ditembak otomatis oleh Tripay/Midtrans saat user membayar
router.post('/tripay', async (req, res) => {
  const tripaySignature = req.headers['x-callback-signature'];
  const jsonBody = JSON.stringify(req.body);
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;

  // Validasi keamanan Webhook (Wajib untuk production)
  const signature = crypto.createHmac('sha256', privateKey).update(jsonBody).digest('hex');
  if (signature !== tripaySignature) {
    return res.status(400).json({ success: false, message: 'Invalid Signature' });
  }

  const { merchant_ref, status } = req.body; // merchant_ref adalah nomor invoice kita

  if (status === 'PAID') {
    await Transaction.findOneAndUpdate(
      { invoice: merchant_ref },
      { status: 'Dibayar' }
    );
    // TODO: Hit API Provider TopUp (cth: Digiflazz / VIP Reseller) otomatis di sini
    // Jika sukses dari Digiflazz -> Update status menjadi 'Selesai'
  }

  res.json({ success: true }); // Wajib membalas Tripay dengan sukses
});

module.exports = router;
