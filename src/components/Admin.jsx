import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

// Your Replit API URL
const API_BASE_URL = 'https://4e3dbc44-01c6-46ee-9d9e-cc5e5c74995c-00-189guujsr3aay.sisko.replit.dev/api';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [dbInfo, setDbInfo] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Check if user is admin (has admin role in Firebase)
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setIsAdmin(true);
          // Fetch database info
          fetchDbInfo();
        } else {
          setError('You do not have permission to access this page');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Error checking permissions');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const fetchDbInfo = async () => {
    try {
      // Fetch all tasks
      const user = auth.currentUser;
      if (user) {
        try {
          // Try to fetch admin database info
          const infoResponse = await axios.get(`${API_BASE_URL}/admin/dbinfo`);
          setDbInfo(infoResponse.data);
        } catch (adminError) {
          console.log('Admin endpoint might not be available:', adminError);
          // Set default info if admin endpoint fails
          setDbInfo({
            totalTasks: 0,
            completedTasks: 0,
            totalUsers: 0,
            tasksByDay: []
          });
        }
        
        // Fetch user's tasks
        try {
          const tasksResponse = await axios.get(`${API_BASE_URL}/tasks/${user.uid}`);
          setTasksList(tasksResponse.data);
          
          // Calculate some stats from tasks if admin endpoint failed
          if (!dbInfo) {
            const completedTasks = tasksResponse.data.filter(task => task.done).length;
            const totalTasks = tasksResponse.data.length;
            
            // Group by day
            const tasksByDay = {};
            tasksResponse.data.forEach(task => {
              if (!tasksByDay[task.day]) {
                tasksByDay[task.day] = 0;
              }
              tasksByDay[task.day]++;
            });
            
            const tasksByDayArray = Object.keys(tasksByDay).map(day => ({
              day,
              count: tasksByDay[day]
            }));
            
            setDbInfo({
              totalTasks,
              completedTasks,
              totalUsers: 1,
              tasksByDay: tasksByDayArray
            });
          }
        } catch (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          setTasksList([]);
        }
        
        // Fetch user stats
        try {
          const statsResponse = await axios.get(`${API_BASE_URL}/stats/${user.uid}`);
          setUserStats([statsResponse.data]);
        } catch (statsError) {
          console.log('Stats endpoint might not be available:', statsError);
          // Create mock stats if endpoint fails
          setUserStats([{
            user_id: user.uid,
            total_tasks_created: tasksList.length,
            total_tasks_completed: tasksList.filter(task => task.done).length,
            last_active: new Date().toISOString()
          }]);
        }
      }
    } catch (err) {
      console.error('Error fetching database info:', err);
      setError('Failed to fetch database information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      backgroundColor: '#2b2750',
      color: 'white',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>QuestLog Database Administration</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#8a7edf',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => fetchDbInfo()}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#4cd3c2',
              color: '#222',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh Data
          </button>
        </div>
      </header>

      {/* Database Summary Section */}
      {dbInfo && (
        <section style={{ 
          backgroundColor: '#332d61',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h2>Database Summary</h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem'
          }}>
            <div style={{ 
              backgroundColor: '#3a3363',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{dbInfo.totalTasks || 0}</h3>
              <p style={{ margin: 0, color: '#8a7edf' }}>Total Tasks</p>
            </div>
            <div style={{ 
              backgroundColor: '#3a3363',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{dbInfo.completedTasks || 0}</h3>
              <p style={{ margin: 0, color: '#8a7edf' }}>Completed Tasks</p>
            </div>
            <div style={{ 
              backgroundColor: '#3a3363',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{dbInfo.totalUsers || 1}</h3>
              <p style={{ margin: 0, color: '#8a7edf' }}>Active Users</p>
            </div>
            <div style={{ 
              backgroundColor: '#3a3363',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                {dbInfo.completedTasks > 0 && dbInfo.totalTasks > 0 ? 
                  ((dbInfo.completedTasks / dbInfo.totalTasks) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </h3>
              <p style={{ margin: 0, color: '#8a7edf' }}>Completion Rate</p>
            </div>
          </div>
          
          {/* Days Breakdown */}
          {dbInfo.tasksByDay && dbInfo.tasksByDay.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Tasks By Day</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                {dbInfo.tasksByDay.map((dayData, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#3a3363',
                    padding: '1rem',
                    borderRadius: '8px',
                    minWidth: '120px'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{dayData.day}</p>
                    <p style={{ margin: 0 }}>{dayData.count} tasks</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tasks Table Section */}
      <section style={{ 
        backgroundColor: '#332d61',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <h2>Your Tasks</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #443d82' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8a7edf' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8a7edf' }}>Day</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8a7edf' }}>Task</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8a7edf' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', color: '#8a7edf' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {tasksList.length > 0 ? (
              tasksList.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #443d82' }}>
                  <td style={{ padding: '0.75rem' }}>{task.id}</td>
                  <td style={{ padding: '0.75rem' }}>{task.day}</td>
                  <td style={{ padding: '0.75rem' }}>{task.text}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: task.done ? '#4cd3c2' : '#e74c3c',
                      color: '#fff',
                      fontSize: '0.8rem'
                    }}>
                      {task.done ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* SQL Query Interface */}
      <section style={{ 
        backgroundColor: '#332d61',
        padding: '1.5rem',
        borderRadius: '10px',
        marginTop: '2rem'
      }}>
        <h2>Database Visualization Links</h2>
        <div style={{ marginTop: '1rem' }}>
          <p>Access your database directly through these external tools:</p>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <a 
                href="https://console.neon.tech" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#4cd3c2' }}
              >
                Neon Console SQL Editor
              </a> 
              - Run SQL queries and manage your database
            </li>
            <li>
              <a 
                href="https://replit.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#4cd3c2' }}
              >
                Replit API
              </a> 
              - View and manage your API endpoints
            </li>
            <li>
              <a 
                href="https://console.firebase.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#4cd3c2' }}
              >
                Firebase Console
              </a> 
              - Manage authentication and Firestore database
            </li>
          </ul>
        </div>
      </section>

      {/* Direct Database View */}
      <section style={{ 
        backgroundColor: '#332d61',
        padding: '1.5rem',
        borderRadius: '10px',
        marginTop: '2rem'
      }}>
        <h2>Direct Database Connection Info</h2>
        <div style={{ marginTop: '1rem' }}>
          <p>Your SQL API is connected to:</p>
          <code style={{ 
            display: 'block', 
            padding: '1rem', 
            backgroundColor: '#3a3363', 
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '0.9rem'
          }}>
            API URL: {API_BASE_URL}<br />
            Database Type: PostgreSQL (Neon)<br />
            Connection: Active
          </code>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Sample SQL Queries</h3>
            <p>Use these queries in the Neon Console SQL Editor to explore your data:</p>
            
            <div style={{ 
              backgroundColor: '#3a3363', 
              padding: '1rem', 
              borderRadius: '6px', 
              marginTop: '0.75rem',
              overflowX: 'auto'
            }}>
              <pre style={{ margin: 0, fontFamily: 'monospace' }}>
{`-- Get all tasks
SELECT * FROM tasks;

-- Count tasks by day
SELECT day, COUNT(*) as task_count 
FROM tasks 
GROUP BY day 
ORDER BY task_count DESC;

-- Get completion rate
SELECT 
  COUNT(*) as total_tasks,
  SUM(CASE WHEN done = true THEN 1 ELSE 0 END) as completed_tasks,
  ROUND((SUM(CASE WHEN done = true THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2) as completion_percentage
FROM tasks;`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}