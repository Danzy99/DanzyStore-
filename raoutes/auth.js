const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =========================================================================
// ENDPOINT REGISTER USER
// =========================================================================
// POST: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, whatsapp, password } = req.body;

    // 1. Validasi Input Klien
    if (!username || !email || !whatsapp || !password) {
      return res.status(400).json({ success: false, message: 'Semua data wajib diisi!' });
    }

    // 2. Periksa apakah Email atau Username sudah digunakan
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Username atau Email sudah terdaftar' });
    }

    // 3. Buat User Baru
    // Password otomatis akan di-hash oleh skema pre-save di models/User.js
    const user = await User.create({
      username,
      email,
      whatsapp,
      password_hash: password,
      role: 'user' // Default role sebagai pelanggan biasa
    });

    // 4. Generate JWT Token agar user bisa langsung otomatis masuk setelah register
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registrasi akun berhasil!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat registrasi' });
  }
});

// =========================================================================
// ENDPOINT LOGIN USER
// =========================================================================
// POST: /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi Input Klien
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password harus diisi!' });
    }

    // 2. Cari user berdasarkan email di database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email atau password salah' });
    }

    // 3. Verifikasi Password menggunakan bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Email atau password salah' });
    }

    // 4. Generate JWT Token keamanan tingkat tinggi (berlaku selama 7 hari)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Autentikasi berhasil, selamat datang kembali!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat login' });
  }
});

module.exports = router;
