const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    fathername: {
        type: String,
        required: true
    },

    mothername: {
        type: String,
        required: true
    },

    studentMob: {
        type: String,
        required: true
    },

    parentsMob: {
        type: String,
        required: true
    },

    aadharcard: {
        type: String,
        required: false
    },

    aadharImage: {
        public_id: {
            type: String,
            required: false
        },
        secure_url: {
            type: String,
            required: false
        }
    },
    
    enrollment: {
        type: String,
        required: false
    },

    session:{
        type: String,
        required: true
    },

    course:{
        type: String,
        required: false,
    }

});

module.exports = mongoose.model('Student', StudentSchema);