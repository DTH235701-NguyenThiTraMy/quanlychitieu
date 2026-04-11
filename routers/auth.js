const express = require('express');
const router = express.Router();
const multer = require('multer');

const User = require('../models/user');
const cloudinary = require('../modules/cloudinary');
const { checkGuest } = require('../modules/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });


// ===== REGISTER =====
router.get('/register', checkGuest, (req, res) => {
    res.render('register');
});

router.post('/register', upload.single('avatar'), async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (!email || !password) {
            req.session.error = "Vui lòng nhập đầy đủ!";
            return res.redirect('/register');
        }

        if (password !== confirmPassword) {
            req.session.error = "Mật khẩu không khớp!";
            return res.redirect('/register');
        }

        if (password.length < 6) {
            req.session.error = "Mật khẩu >= 6 ký tự!";
            return res.redirect('/register');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.session.error = "Email đã tồn tại!";
            return res.redirect('/register');
        }

        let avatarUrl = '';

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'avatar' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });

            avatarUrl = result.secure_url;
        }

        await User.create({
            email,
            password,
            avatar: avatarUrl
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
router.get('/login', checkGuest, (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const password = req.body.password;

        req.session.email = email;

        const user = await User.findOne({ email });

        if (!user) {
            req.session.error = "Tài khoản không tồn tại!";
            return res.redirect('/login');
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            req.session.error = "Sai mật khẩu!";
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.avatar = user.avatar;

        const redirectTo = req.session.returnTo || '/transactions';
        delete req.session.returnTo;

        res.redirect(redirectTo);

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