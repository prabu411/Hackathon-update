// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    // Clear old sessions on load
    useEffect(() => { localStorage.clear(); }, []);

    const [userType, setUserType] = useState('student');
    const [isSignup, setIsSignup] = useState(false);

    // Form Inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [department, setDepartment] = useState('');

    const handleLogin = async () => {
        if (userType === 'admin') {
            // ADMIN LOGIN
            try {
                const response = await axios.post('http://localhost:5000/api/admin/login', {
                    username, password
                });

                // --- THE FIX ---
                // We save the WHOLE admin object. No complicated ID checks later.
                localStorage.setItem("currentAdmin", JSON.stringify(response.data.admin));

                alert("Welcome Innovation Coordinator!");
                navigate('/admin-dashboard');

            } catch (error) {
                alert("Invalid Admin Credentials. Please check MongoDB Atlas.");
            }
        } else {
            // STUDENT LOGIN
            try {
                const response = await axios.post('http://localhost:5000/api/students/login', {
                    username, rollNumber, password
                });
                // Save Student Object
                localStorage.setItem("currentStudent", JSON.stringify(response.data.student));

                alert("Welcome " + response.data.student.name);
                navigate('/student-dashboard');
            } catch (error) {
                alert("Login Failed: " + (error.response?.data?.error || "Error"));
            }
        }
    };

    const handleSignup = async () => {
        try {
            await axios.post('http://localhost:5000/api/students/signup', {
                name, year, department, rollNumber, username, password
            });
            alert("✅ Signup Successful!");
            setIsSignup(false);
        } catch (error) {
            alert("Signup Failed.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>SRI ESHWAR COLLEGE OF ENGINEERING</h1>
                <h2>Hackathon Portal</h2>
                <div className="toggle-group">
                    <button className={userType === 'student' ? 'active' : ''} onClick={() => setUserType('student')}>Student</button>
                    <button className={userType === 'admin' ? 'active' : ''} onClick={() => setUserType('admin')}>Admin</button>
                </div>

                {userType === 'student' && isSignup ? (
                    <>

                        <input type="text" placeholder="Name" onChange={e => setName(e.target.value)} />

                        <input type="text" placeholder="Department" onChange={e => setDepartment(e.target.value)} />

                        <input type="text" placeholder="Year" onChange={e => setYear(e.target.value)} />

                        <input type="text" placeholder="Roll No" onChange={e => setRollNumber(e.target.value)} />

                        <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />

                        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

                        <button className="action-btn" onClick={handleSignup}>Sign Up</button>
                        <p onClick={() => setIsSignup(false)} className="switch-text">Login</p>
                    </>
                ) : (
                    <>
                        <input type="text" placeholder={userType === 'admin' ? "Admin Username" : "Username"} onChange={e => setUsername(e.target.value)} />
                        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />


                        <button className="action-btn" onClick={handleLogin}>Login</button>
                        {userType === 'student' && <p onClick={() => setIsSignup(true)} className="switch-text">Create Account</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;