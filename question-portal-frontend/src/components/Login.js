import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Добавлен стейт для ошибки
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/auth/login', { email, password });
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('jwt-token', userData['jwt-token']);
            localStorage.setItem('id', userData['id']);
            navigate('/home');
        } catch (error) {
            setError('Login failed. Please check your credentials and try again.');
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4" style={{ width: '20rem' }}>
                <div className="card-body">
                    <h5 className="card-title text-center mb-4">LOGOTYPE</h5>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>} {/* Отображение ошибки */}
                        <button type="submit" className="btn btn-primary w-100">Log In</button>
                    </form>
                    <div className="text-center mt-3">
                        <span>Don't have an account? </span><a href="/register">Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;




