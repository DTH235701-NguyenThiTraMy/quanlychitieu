const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    avatar: {
        type: String,
        default: ''
    }

}, { timestamps: true });


// 🔥 HASH PASSWORD TRƯỚC KHI LƯU
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// 🔥 SO SÁNH PASSWORD KHI LOGIN
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);