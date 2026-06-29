const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Anti-Spam Rate Limiter (Mencegah brute-force & spam checkout)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // limit 100 request per IP
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth')); // Buat file ini untuk register/login
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/admin', require('./routes/admin')); // Buat file ini untuk dashboard owner

// Database & Server Init
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
