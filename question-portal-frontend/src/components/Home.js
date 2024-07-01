import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import EditProfile from './EditProfile';
import DeleteProfile from './DeleteProfile';
import Questions from './Questions';

const Home = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [showDeleteProfile, setShowDeleteProfile] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('jwt-token');
        navigate('/login');
    };

    const handleDeleteProfile = () => {
        setShowDeleteProfile(true);
    };

    const handleCloseDeleteProfile = () => {
        setShowDeleteProfile(false);
    };

    const handleProfileDeleted = () => {
        setUser(null);
    };

    const handleShowQuestions = () => {
        setShowQuestions(true);
    };

    const handleCloseQuestions = () => {
        setShowQuestions(false);
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">LOGOTYPE</Link>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button className="nav-link btn" onClick={handleShowQuestions}>Your questions</button>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/answer">Answer the question</Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {user.firstName}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li><Link className="dropdown-item" to={`/edit-profile/${user.id}`}>Edit Profile</Link></li>
                                    <li><button className="dropdown-item" onClick={handleDeleteProfile}>Delete Profile</button></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Log Out</button></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container">
                {showQuestions ? (
                    <Questions onClose={handleCloseQuestions} />
                ) : (
                    <Routes>
                        <Route path="/" element={<HomeContent />} />
                        <Route path="/edit-profile/:id" element={<EditProfile setUser={setUser} />} />
                    </Routes>
                )}
            </div>

            {showDeleteProfile && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <DeleteProfile onDelete={handleProfileDeleted} onClose={handleCloseDeleteProfile} />
                    </div>
                </div>
            )}
        </div>
    );
};

const HomeContent = () => {
    return (
        <div className="container">
            <h2>Home</h2>
            <p>Welcome to the Home page!</p>
        </div>
    );
};

export default Home;




