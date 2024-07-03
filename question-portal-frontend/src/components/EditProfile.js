import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditProfile = ({ setUser }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('jwt-token');
                if (!token) {
                    console.error('No JWT token found');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/users/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    const userData = response.data.user;
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setEmail(userData.email || '');
                    setPhoneNumber(userData.phoneNumber || '');
                } else {
                    console.error('Failed to fetch profile data:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            }
        };

        fetchProfileData();
    }, [id]);

    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Current password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('jwt-token');
            if (!token) {
                console.error('No JWT token found');
                return;
            }

            const response = await axios.patch(`http://localhost:8080/users/${id}`, {
                firstName,
                lastName,
                email,
                phoneNumber,
                password,
                newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const { firstName: updatedFirstName, 'jwt-token': jwtToken } = response.data;
                localStorage.setItem('jwt-token', jwtToken);
                setUser((prevUser) => ({
                    ...prevUser,
                    firstName: updatedFirstName
                }));
                navigate('/home');
            } else {
                console.error('Failed to save profile:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{ width: '400px' }}>
                <h2 className="text-center mb-4">Edit Profile</h2>
                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Current Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                <div className="form-group mb-4">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary btn-block mb-3" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
};

export default EditProfile;
