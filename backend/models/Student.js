const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },

    department: { type: String, required: true },
    year: { type: String, required: true },

    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    myHackathons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon'
    }]
});

module.exports = mongoose.model('Student', StudentSchema);