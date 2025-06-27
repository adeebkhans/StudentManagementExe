const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    session: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    deposited: {
        type: Number,
        required: true
    },
    remaining: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Fee', FeeSchema);