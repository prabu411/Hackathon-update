const mongoose = require('mongoose');

const HackathonSchema = new mongoose.Schema({
    name: { type: String, required: true },

    organizedBy: { type: String, required: true },

    date: { type: String, required: true },

    description: { type: String, required: true },

    link: { type: String, required: true },

    registrations: { type: Number, default: 0 }
});

module.exports = mongoose.model('Hackathon', HackathonSchema);