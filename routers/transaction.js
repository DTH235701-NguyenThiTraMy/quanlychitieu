const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../modules/cloudinary');

const Transaction = require('../models/transaction');
const checkLogin = require('../modules/authMiddleware');

// upload RAM
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== DANH SÁCH =====
router.get('/', checkLogin, async (req, res) => {
    const data = await Transaction.find({ userId: req.session.userId });

    let totalThu = 0;
    let totalChi = 0;
    let dailyMap = {};

    data.forEach(item => {
        if (item.type === 'thu') totalThu += item.amount;
        else totalChi += item.amount;

        // ===== GROUP THEO NGÀY =====
        const date = new Date(item.date).toISOString().slice(0, 10);

        if (!dailyMap[date]) {
            dailyMap[date] = {
                thu: 0,
                chi: 0,
                images: []
            };
        }

        if (item.type === 'thu') dailyMap[date].thu += item.amount;
        else dailyMap[date].chi += item.amount;

        if (item.image) {
            dailyMap[date].images.push(item.image);
        }
    });

    res.render('transactions', {
        data,
        totalThu,
        totalChi,
        dailyMap
    });
});

// ===== THÊM =====
router.post('/add', checkLogin, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = '';

        if (req.file) {
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'chitieu' },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    stream.end(req.file.buffer);
                });
            };

            const result = await streamUpload();
            imageUrl = result.secure_url;
        }

        await Transaction.create({
            userId: req.session.userId,
            type: req.body.type,
            amount: req.body.amount,
            note: req.body.note,
            date: req.body.date,
            category: req.body.category,
            image: imageUrl
        });

        req.session.success = "Thêm thành công!";
        res.redirect('/transactions');

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi upload!";
        res.redirect('/transactions');
    }
});

// ===== XÓA =====
router.get('/delete/:id', checkLogin, async (req, res) => {
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect('/transactions');
});

module.exports = router;