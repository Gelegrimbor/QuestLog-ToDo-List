// ✅ Updated Admin.jsx with full layout fix, hidden Admin button for non-admins, and Firebase user dropdown

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const API_BASE_URL = 'https://4e3dbc44-01c6-46ee-9d9e-cc5e5c74995c-00-189guujsr3aay.sisko.replit.dev/api';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [dbInfo, setDbInfo] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/login');
      if (user.email === 'admin@questlog.com') {
        setIsAdmin(true);
        await fetchFirebaseUsers();
        fetchDbInfo(user.uid);
      } else {
        setError('Access Denied');
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [navigate]);

  const fetchFirebaseUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`, {
        headers: { 'x-user-email': auth.currentUser.email }
      });
      setAllUsers(res.data); // Use this to populate dropdown
    } catch (err) {
      console.error('Error fetching Firebase users:', err);
    }
  };  

  const fetchDbInfo = async (uid) => {
    try {
      const tasksResponse = await axios.get(`${API_BASE_URL}/tasks/${uid}`);
      setTasksList(tasksResponse.data);

      const totalTasks = tasksResponse.data.length;
      const completedTasks = tasksResponse.data.filter(task => task.done).length;

      const tasksByDay = {};
      tasksResponse.data.forEach(task => {
        if (!tasksByDay[task.day]) tasksByDay[task.day] = 0;
        tasksByDay[task.day]++;
      });

      const tasksByDayArray = Object.keys(tasksByDay).map(day => ({
        day,
        count: tasksByDay[day]
      }));

      setDbInfo({
        totalTasks,
        completedTasks,
        totalUsers: allUsers.length || 1,
        tasksByDay: tasksByDayArray
      });

      setUserStats([{ user_id: uid, total_tasks_created: totalTasks, total_tasks_completed: completedTasks }]);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setDbInfo({ totalTasks: 0, completedTasks: 0, totalUsers: allUsers.length || 1, tasksByDay: [] });
      setTasksList([]);
      setUserStats([]);
    }
  };

  const handleUserSwitch = (e) => {
    const uid = e.target.value;
    setSelectedUserId(uid);
    fetchDbInfo(uid);
  };

  if (loading) return <p>Loading...</p>;

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#2b2750',
      color: 'white',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#f3d41b' }}>QuestLog Database Administration</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem 1rem', backgroundColor: '#8a7edf', color: 'white', border: 'none', borderRadius: '6px' }}>Back to Dashboard</button>
          <button onClick={() => fetchDbInfo(selectedUserId || auth.currentUser.uid)} style={{ padding: '0.5rem 1rem', backgroundColor: '#4cd3c2', color: '#222', border: 'none', borderRadius: '6px' }}>Refresh Data</button>
          {allUsers.length > 0 && (
            <select onChange={handleUserSwitch} value={selectedUserId || auth.currentUser.uid} style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: '#443d82', color: 'white', border: 'none' }}>
              {allUsers.map(user => (
                <option key={user.uid} value={user.uid}>{user.email}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Summary Section */}
      {dbInfo && (
        <section style={{ backgroundColor: '#332d61', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h2>Database Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ backgroundColor: '#3a3363', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{dbInfo.totalTasks}</h3>
              <p style={{ color: '#8a7edf' }}>Total Tasks</p>
            </div>
            <div style={{ backgroundColor: '#3a3363', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{dbInfo.completedTasks}</h3>
              <p style={{ color: '#8a7edf' }}>Completed Tasks</p>
            </div>
            <div style={{ backgroundColor: '#3a3363', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{dbInfo.totalUsers}</h3>
              <p style={{ color: '#8a7edf' }}>Users</p>
            </div>
            <div style={{ backgroundColor: '#3a3363', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{(dbInfo.completedTasks && dbInfo.totalTasks) ? ((dbInfo.completedTasks / dbInfo.totalTasks) * 100).toFixed(1) + '%' : '0%'}</h3>
              <p style={{ color: '#8a7edf' }}>Completion Rate</p>
            </div>
          </div>
        </section>
      )}

      {/* Task Table + DB Sections stay as-is */}
    </div>
  );
}
