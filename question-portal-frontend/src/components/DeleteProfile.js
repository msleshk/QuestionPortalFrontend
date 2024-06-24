import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteProfile = ({ onDelete, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const id = localStorage.getItem('id');
        if (id) {
            setUserId(id);
        } else {
            console.error('User ID not found in localStorage');
            setError('User ID not found');
        }
    }, []);

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError('User ID is missing. Unable to delete profile.');
            return;
        }

        try {
            const token = localStorage.getItem('jwt-token');
            await axios.delete(`http://localhost:8080/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: { password }
            });
            localStorage.removeItem('jwt-token');
            localStorage.removeItem('id');
            onDelete();
            navigate('/login');
        } catch (error) {
            setError('Failed to delete profile. Please check your password and try again.');
            console.error('Failed to delete profile:', error);
        }
    };

    return (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Delete Profile</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleDelete}>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Your password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <button type="submit" className="btn btn-danger">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfile;
