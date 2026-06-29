
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Game = require('../models/Game');
const { protect, admin } = require('../middleware/auth');

// =========================================================================
// OWNER DASHBOARD STATS (Mendapatkan Data Analitik Bisnis)
// =========================================================================
// GET: /api/admin/dashboard
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const totalUser = await User.countDocuments({ role: 'user' });
    const totalOrder = await Transaction.countDocuments();
    
    // Hitung total pendapatan dari transaksi yang statusnya 'Dibayar' atau 'Selesai'
    const revenueData = await Transaction.aggregate([
      { $match: { status: { $in: ['Dibayar', 'Diproses', 'Selesai'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const pendapatan = revenueData.length > 0 ? revenueData[0].total : 0;

    const orderPending = await Transaction.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      stats: {
        total_user: totalUser,
        total_order: totalOrder,
        pendapatan: pendapatan,
        order_pending: orderPending
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard' });
  }
});

// =========================================================================
// TRANSACTION MANAGEMENT (Kelola Semua Transaksi Masuk)
// =========================================================================
// GET: /api/admin/transactions (Mendukung Pencarian & Filter Tanggal)
router.get('/transactions', protect, admin, async (req, res) => {
  try {
    const { search, start_date, end_date } = req.query;
    let query = {};

    // Fitur Search berdasarkan Invoice atau Game
    if (search) {
      query.$or = [
        { invoice: { $regex: search, $options: 'i' } },
        { game: { $regex: search, $options: 'i' } }
      ];
    }

    // Fitur Filter Rentang Tanggal
    if (start_date && end_date) {
      query.created_at = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('user_id', 'username email')
      .sort({ created_at: -1 });

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi' });
  }
});

// PUT: /api/admin/transactions/:id/status (Ubah Status Transaksi manual)
router.put('/transactions/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ['Pending', 'Dibayar', 'Diproses', 'Selesai', 'Gagal'];
    
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const updatedTx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedTx) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    res.json({ success: true, message: 'Status transaksi berhasil diubah', updatedTx });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status transaksi' });
  }
});

// DELETE: /api/admin/transactions/:id (Hapus Transaksi)
router.delete('/transactions/:id', protect, admin, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus transaksi' });
  }
});

// =========================================================================
// GAME & PRODUCT MANAGEMENT (Kelola Game dan Varian Nominal Top-Up)
// =========================================================================
// POST: /api/admin/games (Tambah Game Baru beserta struktur Input Fieldnya)
router.post('/games', protect, admin, async (req, res) => {
  try {
    const { name, image_url, category, input_fields } = req.body;
    
    // Buat slug otomatis, cth: "Mobile Legends" -> "mobile-legends"
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const newGame = await Game.create({
      name,
      slug,
      image_url,
      category,
      input_fields // Array contoh: ["User ID", "Zone ID"]
    });

    res.status(201).json({ success: true, message: 'Game berhasil ditambahkan', newGame });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan game' });
  }
});

// POST: /api/admin/games/:game_id/products (Tambah Nominal Produk ke Dalam Game)
router.post('/games/:game_id/products', protect, admin, async (req, res) => {
  try {
    const { name, price, promo_price } = req.body;
    const game = await Game.findById(req.params.game_id);
    
    if (!game) return res.status(404).json({ message: 'Game tidak ditemukan' });

    // Push sub-document product baru ke dalam array game
    game.products.push({ name, price, promo_price });
    await game.save();

    res.status(201).json({ success: true, message: 'Nominal produk berhasil ditambahkan ke ' + game.name });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan produk' });
  }
});

// DELETE: /api/admin/games/:id (Hapus Game)
router.delete('/games/:id', protect, admin, async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Game berhasil dihapus dari platform' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus game' });
  }
});

// =========================================================================
// USER MANAGEMENT (Pantau & Kontrol Keamanan Pengguna)
// =========================================================================
// GET: /api/admin/users (Melihat semua Akun terdaftar)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password_hash').sort({ created_at: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat daftar user' });
  }
});

// DELETE: /api/admin/users/:id (Hapus/Kick User permanen)
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User berhasil dihapus dari database' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus user' });
  }
});

module.exports = router;
