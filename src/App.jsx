import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
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

  // Check if user is admin
  const isAdmin = user && user.email === "admin@questlog.com";

  // Protected route component
  const ProtectedRoute = ({ element }) => {
    if (loading) return <div></div>;
    return user ? element : <Navigate to="/login" />;
  };

  // Admin route component
  const AdminRoute = ({ element }) => {
    if (loading) return <div></div>;
    return (user && isAdmin) ? element : <Navigate to="/dashboard" />;
  };

  const handleLogout = () => {
    auth.signOut();
    // Redirect to home page instead of login page
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app">
        {user && (
          <header>
            <div className="logo">QuestLog</div>
            <nav>
              {/* Only show Admin button if user email is admin@questlog.com */}
              {isAdmin && (
                <a href="/admin" className="admin-btn">Admin</a>
              )}
              <a href="/chat" className="chat-ai-btn">Chat AI</a>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </nav>
          </header>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          {/* Protected admin route - only accessible if user email is admin@questlog.com */}
          <Route path="/admin" element={<AdminRoute element={<Admin />} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;