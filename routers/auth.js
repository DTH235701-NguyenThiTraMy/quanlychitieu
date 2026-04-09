const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user');


// ===== REGISTER =====
router.get('/register', (req, res) => {
    res.render('register', { title: 'Đăng ký' });
});

router.post('/register', async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const password = req.body.password;

        if (!email || !password) {
            req.session.error = "Vui lòng nhập đầy đủ thông tin!";
            return res.redirect('/register');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.session.error = "Email đã tồn tại!";
            return res.redirect('/register');
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        await User.create({
            email,
            password: hashedPassword
        });

        req.session.success = "Đăng ký thành công!";
        res.redirect('/login');

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi đăng ký!";
        res.redirect('/register');
    }
});


// ===== LOGIN =====
router.get('/login', (req, res) => {
    res.render('login', { title: 'Đăng nhập' });
});

router.post('/login', async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const password = req.body.password;

        const user = await User.findOne({ email });

        if (!user) {
            req.session.error = "Tài khoản không tồn tại!";
            return res.redirect('/login');
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            req.session.error = "Sai mật khẩu!";
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.email = user.email;

        res.redirect('/transactions');

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi đăng nhập!";
        res.redirect('/login');
    }
});


// ===== LOGOUT =====
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});


module.exports = router;