const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Hackathon = require('../models/Hackathon');

router.post('/login', async (req, res) => {
    try {
        const { name, rollNumber, year } = req.body;

        let student = await Student.findOne({ rollNumber });

        if (!student) {

            student = new Student({ name, rollNumber, year });
            await student.save();
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

router.post('/register-event', async (req, res) => {
    try {
        const { studentId, hackathonId } = req.body;

        const student = await Student.findById(studentId);
        const hackathon = await Hackathon.findById(hackathonId);

        if (!student || !hackathon) {
            return res.status(404).json({ error: "Student or Hackathon not found" });
        }

        if (student.myHackathons.includes(hackathonId)) {
            return res.status(400).json({ error: "You are already registered for this event!" });
        }

        student.myHackathons.push(hackathonId);
        await student.save();

        // Increase registration count for the event
        hackathon.registrations += 1;
        await hackathon.save();

        res.json({ message: "Registration Successful!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// Get a specific student's registered hackathons
router.get('/my-events/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('myHackathons');
        res.json(student.myHackathons);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch events" });
    }
});

module.exports = router;