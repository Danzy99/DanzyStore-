const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  invoice: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: String, required: true },
  account_id: { type: String, required: true }, // User ID / Zone ID
  product: { type: String, required: true },
  price: { type: Number, required: true },
  payment_method: { type: String, required: true },
  payment_reference: { type: String }, // Referensi dari Tripay/Midtrans
  status: { type: String, enum: ['Pending', 'Dibayar', 'Diproses', 'Selesai', 'Gagal'], default: 'Pending' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Transaction', transactionSchema);
