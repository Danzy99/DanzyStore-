const mongoose = require('mongoose');

// Skema untuk Nominal/Produk di dalam Game
const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Contoh: "86 Diamonds", "Weekly Diamond Pass"
  price: { type: Number, required: true }, // Harga asli
  promo_price: { type: Number, default: 0 }, // Harga diskon (jika ada promo)
  is_active: { type: Boolean, default: true } // Status produk
});

// Skema Utama untuk Game
const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Contoh: "Mobile Legends"
  slug: { type: String, required: true, unique: true }, // Contoh: "mobile-legends" (untuk URL)
  image_url: { type: String, required: true }, // Link gambar banner/logo game
  category: { type: String, required: true }, // Contoh: "Mobile Games", "PC Games"
  
  // Panduan input untuk user (seperti di Codashop)
  input_fields: [{ type: String }], // Contoh array: ["User ID", "Zone ID"] untuk ML, atau ["Player ID"] untuk FF
  
  is_active: { type: Boolean, default: true }, // Status game (bisa dimatikan owner jika sedang gangguan)
  
  // Relasi produk (nominal top-up) yang terikat dengan game ini
  products: [productSchema] 
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Game', gameSchema);
