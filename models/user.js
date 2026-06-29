const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  whatsapp: { type: String, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner'], default: 'user' },
  total_transactions: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Hash password sebelum save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
