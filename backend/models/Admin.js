const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, default: "Innovation Coordinator" },
    department: { type: String, default: "Innovation Cell" }
});

module.exports = mongoose.model('Admin', AdminSchema);