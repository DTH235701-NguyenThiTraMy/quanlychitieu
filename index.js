const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

require('dotenv').config();

// ===== IMPORT ROUTERS =====
const authRouter = require('./routers/auth');
const transactionRouter = require('./routers/transaction');

// ===== KẾT NỐI MONGODB =====
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log("✅ Kết nối MongoDB thành công"))
    .catch(err => console.log("❌ Lỗi kết nối DB:", err));

// ===== CẤU HÌNH VIEW =====
app.set('views', './views');
app.set('view engine', 'ejs');

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static file
app.use(express.static(path.join(__dirname, 'public')));



// ===== SESSION =====
app.use(session({
    name: 'ChiTieuApp',
    secret: 'secret-key-123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));

// ===== GLOBAL MESSAGE =====
app.use((req, res, next) => {
    res.locals.session = req.session;

    let err = req.session.error;
    let msg = req.session.success;

    delete req.session.error;
    delete req.session.success;

    res.locals.message = '';
    if (err) res.locals.message = `<span style="color:red">${err}</span>`;
    if (msg) res.locals.message = `<span style="color:green">${msg}</span>`;

    next();
});

// ===== ROUTES =====
app.use('/', authRouter);
app.use('/transactions', transactionRouter);

// ===== HOME =====
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/transactions');
    } else {
        res.redirect('/login');
    }
});

// ===== SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});