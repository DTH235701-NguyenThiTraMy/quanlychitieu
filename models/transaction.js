const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        min: 0
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
        type: String
    },

    category: {
        type: String,
        default: 'Khác'
    }

});

module.exports = mongoose.model('Transaction', transactionSchema);