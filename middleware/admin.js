const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware untuk memproteksi rute khusus Owner/Admin
 * Memeriksa validitas JWT Token dan hak akses Role 'owner'
 */
const isAdmin = async (req, res, next) => {
  try {
    let token;

    // 1. Memeriksa apakah token dikirim melalui Header Authorization (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Jika token tidak ditemukan di header
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Akses ditolak! Anda harus login sebagai Owner terlebih dahulu.' 
      });
    }

    // 2. Verifikasi keaslian token JWT menggunakan Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Tarik data user berdasarkan ID dari payload token, kecualikan password_hash demi keamanan
    const user = await User.findById(decoded.id).select('-password_hash');
    
    if (!user) {
      return res.status(444).json({ 
        success: false, 
        message: 'Sesi ilegal. Akun pengguna tidak ditemukan di database.' 
      });
    }

    // 4. VALIDASI UTAMA: Pastikan role wajib bernilai 'owner'
    if (user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses terlarang! Anda tidak memiliki izin untuk mengakses panel ini.' 
      });
    }

    // 5. Lolos semua verifikasi: Simpan data admin ke objek request (req.user) agar bisa dipakai di router berikutnya
    req.user = user;
    next(); // Lanjutkan ke core function di routes/admin.js

  } catch (error) {
    // Menangani token kedaluwarsa atau dimanipulasi secara ilegal
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Sesi Admin telah berakhir, silakan login ulang.' });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token tidak valid / Korup. Akses ditolak!' 
    });
  }
};

module.exports = isAdmin;
