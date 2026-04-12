const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../modules/cloudinary');

const Transaction = require('../models/transaction');
const { checkLogin } = require('../modules/authMiddleware');

// upload RAM
const storage = multer.memoryStorage();
const upload = multer({ storage });

const categories = [
    "Ăn uống", "Đi lại", "Nhà ở", "Mua sắm",
    "Giải trí", "Y tế", "Giáo dục", "Hóa đơn",
    "Lương", "Thưởng", "Đầu tư", "Freelance", "Khác"
];


// ===== DANH SÁCH =====
router.get('/', checkLogin, async (req, res) => {
    try {
        const userId = req.session.userId;

        let selectedMonth = req.query.month;

        if (!selectedMonth) {
            const now = new Date();
            selectedMonth = now.toISOString().slice(0, 7);
        }

        const start = new Date(selectedMonth + "-01");
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const data = await Transaction.find({
            userId,
            date: { $gte: start, $lt: end }
        }).sort({ date: -1 });

        // ===== TÍNH TOÁN =====
        let monthThu = 0;
        let monthChi = 0;

        const dailyMap = {};

        data.forEach(item => {
            if (item.type === 'thu') monthThu += item.amount;
            else monthChi += item.amount;

            const d = new Date(item.date).toISOString().slice(0, 10);

            if (!dailyMap[d]) {
                dailyMap[d] = { thu: 0, chi: 0, images: [] };
            }

            if (item.type === 'thu') dailyMap[d].thu += item.amount;
            else dailyMap[d].chi += item.amount;

            if (item.image) dailyMap[d].images.push(item.image);
        });

        res.render('transactions', {
            data,
            monthThu,
            monthChi,
            selectedMonth,
            dailyMap,
            categories
        });

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi!";
        res.redirect('/transactions');
    }
});


// ===== THÊM =====
router.post('/add', checkLogin, upload.single('image'), async (req, res) => {
    try {
        if (!req.body.amount || req.body.amount <= 0) {
            req.session.error = "Số tiền không hợp lệ!";
            return res.redirect('/transactions');
        }
        // ===== CHECK NGÀY KHÔNG ĐƯỢC > HÔM NAY =====
        const inputDate = new Date(req.body.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate > today) {
            req.session.error = "Không được chọn ngày trong tương lai!";
            return res.redirect('/transactions');
        }

        let imageUrl = '';

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'chitieu' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });

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
router.post('/delete/:id', checkLogin, async (req, res) => {
    try {
        await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.session.userId
        });

        req.session.success = "Xóa thành công!";
        res.redirect('/transactions');

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi xóa!";
        res.redirect('/transactions');
    }
});


// ===== CALENDAR =====
router.get('/calendar', checkLogin, async (req, res) => {
    try {
        const selectedMonth = req.query.month || new Date().toISOString().slice(0, 7);
        const [year, month] = selectedMonth.split('-');

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const data = await Transaction.find({
            userId: req.session.userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: 1 });

        const grouped = {};
        data.forEach(item => {
            const d = new Date(item.date).getDate();
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(item);
        });

        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();

        res.render('calendar', {
            grouped,
            data,
            firstDay,
            daysInMonth,
            selectedMonth,
            jsonData: JSON.stringify(data)
        });

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi calendar!";
        res.redirect('/transactions');
    }
});


// ===== XEM THEO NGÀY =====
router.get('/day/:date', checkLogin, async (req, res) => {
    try {
        const selectedDate = req.params.date;

        const start = new Date(selectedDate);
        const end = new Date(selectedDate);
        end.setDate(end.getDate() + 1);

        const data = await Transaction.find({
            userId: req.session.userId,
            date: { $gte: start, $lt: end }
        });

        res.render('day', {
            data,
            selectedDate
        });

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi!";
        res.redirect('/transactions');
    }
});


// ===== EDIT =====
router.get('/edit/:id', checkLogin, async (req, res) => {
    const item = await Transaction.findOne({
        _id: req.params.id,
        userId: req.session.userId
    });

    res.render('edit', { item, categories });
});


router.post('/edit/:id', checkLogin, upload.single('image'), async (req, res) => {
    try {
        const old = await Transaction.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        // ===== CHECK NGÀY KHÔNG ĐƯỢC > HÔM NAY =====
        const inputDate = new Date(req.body.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate > today) {
            req.session.error = "Không được chọn ngày trong tương lai!";
            return res.redirect('/transactions');
        }

        let imageUrl = old.image;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'chitieu' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(req.file.buffer);
            });

            imageUrl = result.secure_url;
        }

        await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.userId },
            {
                type: req.body.type,
                amount: req.body.amount,
                category: req.body.category,
                note: req.body.note,
                date: req.body.date,
                image: imageUrl
            }
        );

        req.session.success = "Cập nhật thành công!";
        res.redirect('/transactions');

    } catch (err) {
        console.log(err);
        req.session.error = "Lỗi cập nhật!";
        res.redirect('/transactions');
    }
});

module.exports = router;