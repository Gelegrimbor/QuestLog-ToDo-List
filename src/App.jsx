import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user && user.email === "admin@questlog.com";

  const ProtectedRoute = ({ element }) => {
    if (loading) return <div></div>;
    return user ? element : <Navigate to="/login" />;
  };

  const AdminRoute = ({ element }) => {
    if (loading) return <div></div>;
    return (user && isAdmin) ? element : <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <div className="app">
        {/* 🧼 Header removed to avoid duplication */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/admin" element={<AdminRoute element={<Admin />} />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </div>
    </Router>
  );
}

export default App;
