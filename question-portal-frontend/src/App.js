import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Questions from './components/Questions';
import EditProfile from './components/EditProfile';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                <Route path="/edit-profile/:id" element={user ? <EditProfile setUser={setUser} /> : <Navigate to="/login" />} />
                <Route path="/questions" element={user ? <Questions /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;










