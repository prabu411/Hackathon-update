const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Models
const Hackathon = require('./models/Hackathon');
const Student = require('./models/Student');
const Admin = require('./models/Admin');

const app = express();

app.use(express.json());
app.use(cors());


//  ADMIN ROUTES   ADMIN LOGIN
app.post('/api/admin/login', async (req, res) => {
    // 1. Log what the user typed
    console.log("👉 Admin Login Attempt:", req.body.username);

    try {
        const { username, password } = req.body;

        // 2. Search MongoDB Atlas
        const admin = await Admin.findOne({ username });

        // 3. Log what MongoDB found
        console.log(" Result from Database:", admin);

        if (!admin) {
            console.log("ERROR: Admin user NOT found in 'admins' collection.");
            return res.status(401).json({ error: "User not found in Database" });
        }

        if (admin.password !== password) {
            console.log(" ERROR: Password mismatch.");
            return res.status(401).json({ error: "Wrong Password" });
        }

        console.log(" SUCCESS: Admin Logged In.");
        res.json({ message: "Welcome Admin", admin });

    } catch (error) {
        console.error(" Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// B. GET ADMIN DETAILS
app.get('/api/admin/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// C. CREATE HACKATHON
app.post('/api/hackathons/create', async (req, res) => {
    try {
        const { name, organizedBy, date, description, link } = req.body;
        const newHackathon = new Hackathon({ name, organizedBy, date, description, link });
        await newHackathon.save();
        res.status(201).json({ message: "Hackathon Created!", hackathon: newHackathon });
    } catch (error) {
        res.status(500).json({ error: "Failed to create" });
    }
});

// D. UPDATE HACKATHON
app.put('/api/hackathons/update/:id', async (req, res) => {
    try {
        await Hackathon.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update" });
    }
});

// DELETE HACKATHON
app.delete('/api/hackathons/delete/:id', async (req, res) => {
    try {
        await Hackathon.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

// GET PARTICIPANTS
app.get('/api/hackathons/participants/:id', async (req, res) => {
    try {
        const participants = await Student.find({ myHackathons: req.params.id });
        res.json(participants);
    } catch (error) {
        res.status(500).json({ error: "Error fetching students" });
    }
});

// GET ALL EVENTS
app.get('/api/hackathons/all', async (req, res) => {
    try {
        const hackathons = await Hackathon.find();
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({ error: "Error fetching events" });
    }
});


// STUDENT ROUTES

app.post('/api/students/signup', async (req, res) => {
    try {
        const { name, year, department, rollNumber, username, password } = req.body;
        const newStudent = new Student({ name, year, department, rollNumber, username, password });
        await newStudent.save();
        res.json({ message: "Signup Successful!" });
    } catch (error) {
        res.status(500).json({ error: "Signup Failed" });
    }
});

app.post('/api/students/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const student = await Student.findOne({ username });
        if (!student || student.password !== password) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        res.json({ message: "Success", student });
    } catch (error) {
        res.status(500).json({ error: "Login Error" });
    }
});

app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: "Student not found" });
    }
});

app.post('/api/students/register-event', async (req, res) => {
    try {
        const { studentId, hackathonId } = req.body;
        const student = await Student.findById(studentId);

        if (student.myHackathons.includes(hackathonId)) {
            return res.status(400).json({ error: "Already Registered" });
        }

        student.myHackathons.push(hackathonId);
        await student.save();

        const hackathon = await Hackathon.findById(hackathonId);
        hackathon.registrations = (hackathon.registrations || 0) + 1;
        await hackathon.save();

        res.json({ message: "Registered" });
    } catch (error) {
        res.status(500).json({ error: "Registration Failed" });
    }
});

// SERVER START
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB Connected (Atlas Mode)"))
    .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on ${PORT}`));