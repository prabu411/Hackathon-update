const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');


router.post('/create', async (req, res) => {
    try {
        const { name, organizedBy, date, description } = req.body;

        const newHackathon = new Hackathon({
            name,
            organizedBy,
            date,
            description
        });

        await newHackathon.save();
        res.status(201).json({ message: "Hackathon Created!", hackathon: newHackathon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create hackathon" });
    }
});

router.get('/all', async (req, res) => {
    try {
        const hackathons = await Hackathon.find();
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch hackathons" });
    }
});

module.exports = router;