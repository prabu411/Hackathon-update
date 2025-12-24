import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const navigate = useNavigate();

    // States
    const [student, setStudent] = useState(null);
    const [hackathons, setHackathons] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // FETCH  DATA FROM atlas
    useEffect(() => {
        const fetchFromCloud = async () => {
            const storedUser = localStorage.getItem("currentStudent");

            if (!storedUser) {
                alert("🔒 Session not found. Please login.");
                navigate('/');
                return;
            }

            const localID = JSON.parse(storedUser)._id;

            try {
                //new student data
                const studentRes = await axios.get(`https://hackathon-backend-r2qt.onrender.com/api/students/${localID}`);
                const freshStudentData = studentRes.data;
                setStudent(freshStudentData);

                // Get All Hackathons
                const eventsRes = await axios.get('https://hackathon-backend-r2qt.onrender.com/api/hackathons/all');
                const allEvents = eventsRes.data;
                setHackathons(allEvents);

                // Match Data
                if (freshStudentData.myHackathons && freshStudentData.myHackathons.length > 0) {
                    const registered = allEvents.filter(event =>
                        freshStudentData.myHackathons.includes(event._id)
                    );
                    setMyEvents(registered);
                } else {
                    setMyEvents([]);
                }

                setLoading(false);

            } catch (error) {
                console.error("❌ Error syncing with Atlas:", error);
            }
        };

        fetchFromCloud();
    }, [navigate]);

    // 2. REGISTER LOGIC (Atlas Synced)
    const handleRegister = async (event) => {
        if (myEvents.some(e => e._id === event._id)) {
            alert(`You are already registered for ${event.name}!`);
            return;
        }

        const confirmJoin = window.confirm(`Confirm registration for: "${event.name}"?`);
        if (!confirmJoin) return;

        try {
            await axios.post('https://hackathon-backend-r2qt.onrender.com/api/students/register-event', {
                studentId: student._id,
                hackathonId: event._id
            });

            alert(` Success! Saved to Atlas.`);

            // Reload Data
            const updatedStudentRes = await axios.get(`https://hackathon-backend-r2qt.onrender.com/api/students/${student._id}`);
            setStudent(updatedStudentRes.data);
            setMyEvents(prev => [...prev, event]);

        } catch (error) {
            alert("Registration failed. Check internet.");
        }
    };

    // 3. LOGOUT
    const handleLogout = () => {
        if(window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("currentStudent");
            navigate('/');
        }
    };

    if (loading) return <div className="loading-text">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">

            {/* 1. HEADER CENTERED */}
            <header className="main-header">
                <h1>Welcome To Hackathon Portal</h1>
                <p className="quote">"Everything You Do Now Is For Your Future"</p>
            </header>

            <div className="dashboard-content">

                {/* 2. PROFILE & STATS (CENTERED BIG CARD) */}

                <section className="profile-center-card">
                    <h2 className="big-name">Name: {student.name}</h2>
                    <h3 className="big-id">ID: {student.rollNumber}</h3>
                    <p className="dept-text">{student.department}</p>

                    <div className="stats-row">
                        <div className="stat-item">
                            <span>Events Joined</span>
                            <div className="big-count">{myEvents.length}</div>
                        </div>
                    </div>

                    {/* LIST OF REGISTERED EVENTS */}
                    <div className="registered-center-list">
                        <h4>Your Active Registrations:</h4>
                        {myEvents.length === 0 ? <p className="empty-text">No events joined yet.</p> : (
                            <ul>{myEvents.map((e, i) => <li key={i}> {e.name}</li>)}</ul>
                        )}
                    </div>
                </section>


                {/* 3. AVAILABLE EVENTS GRID */}
                <section className="events-section">
                    <h3 className="section-title">Available Opportunities</h3>
                    <div className="events-grid">
                        {hackathons.length === 0 ? <div className="no-events"><h3>No Events Found</h3></div> : (
                            hackathons.map((event) => {
                                const isRegistered = myEvents.some(e => e._id === event._id);
                                return (
                                    <div key={event._id} className="event-card">
                                        <h3>{event.name}</h3>
                                        <p className="organizer">By: {event.organizedBy}</p>
                                        <div className="date-badge"> {event.date}</div>
                                        <p className="desc">{event.description}</p>
                                        <button
                                            className={isRegistered ? "btn-registered" : "btn-register"}
                                            onClick={() => !isRegistered && handleRegister(event)}
                                            disabled={isRegistered}
                                        >
                                            {isRegistered ? "Registered ✅" : "Register Now"}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

            </div>

            {/* 4. FOOTER WITH LOGOUT */}
            <footer className="main-footer">
                <button className="logout-btn-footer" onClick={handleLogout}>Logout</button>
            </footer>

        </div>
    );
};

export default StudentDashboard;