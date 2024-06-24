import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import EditProfile from './components/EditProfile';
import DeleteProfile from './components/DeleteProfile'; // Импортируем компонент DeleteProfile
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
    const [user, setUser] = useState(null); // Состояние для пользователя

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login setUser={setUser} />} /> {/* Передаем setUser */}
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home user={user} setUser={setUser} />} /> {/* Передаем пользователя и setUser */}
                <Route path="/edit-profile/:id" element={<EditProfile setUser={setUser} />} /> {/* Передаем setUser */}
                {/* Удаляем маршрут для DeleteProfile, так как мы показываем его как модальное окно */}
            </Routes>
        </Router>
    );
}

export default App;






