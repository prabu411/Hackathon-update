import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // STATES
    const [admin, setAdmin] = useState(null);
    const [hackathons, setHackathons] = useState([]);
    const [viewingStudents, setViewingStudents] = useState(null);
    const [studentList, setStudentList] = useState([]);

    // Form Handling
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', organizedBy: '', date: '', description: '', link: ''
    });

    //   AUTH CHECK
    useEffect(() => {
        const storedAdmin = localStorage.getItem("currentAdmin");
        if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
            fetchHackathons();
        } else {
            navigate('/');
        }
    }, [navigate]);

    //  FETCH EVENTS
    const fetchHackathons = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/hackathons/all');
            setHackathons(res.data);
        } catch (error) {
            console.error("Error loading events:", error);
        }
    };

    // FORM HANDLERS
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.date || !formData.link) {
            alert("Please fill in essential fields.");
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/hackathons/update/${editId}`, formData);
                alert("Event Updated Successfully!");
                setIsEditing(false);
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/hackathons/create', formData);
                alert("Event Created Successfully!");
            }
            setFormData({ name: '', organizedBy: '', date: '', description: '', link: '' });
            fetchHackathons();
        } catch (error) {
            alert("Operation failed.");
        }
    };

    const handleEditClick = (event) => {
        setIsEditing(true);
        setEditId(event._id);
        setFormData({
            name: event.name, organizedBy: event.organizedBy,
            date: event.date, description: event.description, link: event.link
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', organizedBy: '', date: '', description: '', link: '' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠ Are you sure you want to delete this event?")) {
            try {
                await axios.delete(`http://localhost:5000/api/hackathons/delete/${id}`);
                fetchHackathons();
            } catch (error) {
                alert("Could not delete.");
            }
        }
    };

    const handleViewStudents = async (eventId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/hackathons/participants/${eventId}`);
            setStudentList(res.data);
            setViewingStudents(eventId);
        } catch (error) {
            alert("Error fetching list.");
        }
    };

    const handleLogout = () => {
        if (window.confirm("Confirm Logout?")) {
            localStorage.clear();
            navigate('/');
        }
    };

    if (!admin) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div className="admin-container">

            <header className="main-header">
                <h1>Innovation Coordinator Portal</h1>
                <p className="quote">SRI ESHWAR COLLEGE OF ENGINEERING</p>
            </header>

            <div className="admin-content">

                <section className="welcome-card">
                    <h2>Welcome, {admin.name}</h2>
                    <p>Department: {admin.department}</p>
                </section>

                <section className="form-section">
                    <h3 className="section-title">
                        {isEditing ? " Update Event Details" : " Launch New Hackathon"}
                    </h3>

                    <form className="admin-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="Event Name" required />
                            </div>
                            <div className="input-group">
                                <label>Organizer</label>
                                <input name="organizedBy" value={formData.organizedBy} onChange={handleChange} placeholder="Dept/Club" required />
                            </div>
                            <div className="input-group">
                                <label>Date</label>
                                <input name="date" type="date" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <label>Link</label>
                                <input name="link" value={formData.link} onChange={handleChange} placeholder="Registration URL" required />
                            </div>
                        </div>

                        <div className="input-group full-width">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange}
                                      placeholder="Event details..." rows="3" required></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className={isEditing ? "btn-submit update" : "btn-submit create"}>
                                {isEditing ? "Save Changes" : "Publish Event"}
                            </button>

                            {isEditing && (
                                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>
























                <section className="list-section">
                    <h3 className="section-title">Active Events</h3>
                            <div className="admin-grid">
                        {hackathons.length === 0 ? (
                            <div className="empty-state"><p>No active events.</p></div>
                        ) : (
                            hackathons.map((event) => (
                                <div key={event._id} className="admin-card">
                                    <div className="card-header">
                                        <h4>{event.name}</h4>
                                        <span className="date-tag"> {event.date}</span>
                                    </div>

                                    <p className="organizer">By: {event.organizedBy}</p>
                                    <p className="desc">{event.description}</p>
                                    <a href={event.link} target="_blank" rel="noreferrer" className="link-text">Registration Link</a>

                                    <div className="card-stats">
                                        <span>Registrations: <b>{event.registrations || 0}</b></span>
                                    </div>

                                    {/* BUTTONS SECTION - Updated for Text & Size */}
                                    <div className="card-actions">
                                        <button className="btn-action view" onClick={() => handleViewStudents(event._id)}>
                                            View Students
                                        </button>
                                        <div className="action-right">
                                            <button className="btn-action edit" onClick={() => handleEditClick(event)}>
                                                Update
                                            </button>
                                            <button className="btn-action delete" onClick={() => handleDelete(event._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                                             </div>
                </section>
            </div>

            {viewingStudents && (
                <div className="modal-overlay" onClick={() => setViewingStudents(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3> Applied Students</h3>
                            <button className="close-x" onClick={() => setViewingStudents(null)}>×</button>
                        </div>

                        {/* CENTERED STUDENT LIST */}
                        <div className="student-list-container">
                            {studentList.length === 0 ? (
                                <p className="no-students">No registrations yet.</p>
                            ) : (
                                <table className="student-table">
                                    <thead><tr><th>Name</th><th>ID</th><th>Dept</th></tr></thead>
                                    <tbody>
                                    {studentList.map((std) => (
                                        <tr key={std._id}>
                                            <td>{std.name}</td>
                                            <td>{std.rollNumber}</td>
                                            <td>{std.department}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={() => setViewingStudents(null)}>Close List</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="main-footer">
                <button className="logout-btn-footer" onClick={handleLogout}>Logout</button>
            </footer>

        </div>
    );
};

export default AdminDashboard;