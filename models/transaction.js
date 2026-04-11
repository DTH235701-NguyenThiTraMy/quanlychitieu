const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    type: {
        type: String,
        enum: ['thu', 'chi'],
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Số tiền phải là số nguyên'
        }
    },

    note: {
        type: String,
        trim: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    image: {
        type: String,
        default: ''
    },

    category: {
        type: String,
        //enum: ['Ăn uống', 'Đi lại', 'Mua sắm', 'Giải trí', 'Lương', 'Khác'],
        default: 'Khác'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);