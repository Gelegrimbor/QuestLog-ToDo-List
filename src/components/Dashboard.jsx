// Final Dashboard.jsx layout fix with styled unified task box and OpenAI button
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [enemyHP, setEnemyHP] = useState(20);
  const [myStats, setMyStats] = useState(false);
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [damageText, setDamageText] = useState('');
  const [showAI, setShowAI] = useState(false);
  const navigate = useNavigate();

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    const checkUserStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          if (!data.username) setShowWelcome(true);
          else setUsername(data.username);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkUserStatus();
  }, [navigate]);

  const handleUsernameSubmit = async () => {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { username });
    setShowWelcome(false);
    setUserData((prev) => ({ ...prev, username }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleStats = () => setMyStats((prev) => !prev);
  const toggleAI = () => setShowAI((prev) => !prev);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const updated = {
      ...tasks,
      [selectedDay]: [
        ...(tasks[selectedDay] || []),
        { text: newTask, done: false },
      ],
    };
    setTasks(updated);
    setNewTask('');
  };

  const handleComplete = (index) => {
    const level = userData?.level || 1;
    const damage = level * 2;
    const updatedTasks = tasks[selectedDay].map((t, i) =>
      i === index ? { ...t, done: true } : t
    );
    setTasks({ ...tasks, [selectedDay]: updatedTasks });

    setEnemyHP((prev) => {
      const newHP = prev - damage;
      if (userData) {
        const updatedStats = {
          ...userData.stats,
          tasksCompleted: userData.stats.tasksCompleted + 1,
          totalDamage: userData.stats.totalDamage + damage,
        };
        setUserData((prev) => ({ ...prev, stats: updatedStats }));
      }
      setDamageText(`-${damage} HP`);
      setTimeout(() => setDamageText(''), 1000);
      return newHP <= 0 ? 20 : newHP;
    });
  };

  const handleDelete = (index) => {
    const updated = tasks[selectedDay].filter((_, i) => i !== index);
    setTasks({ ...tasks, [selectedDay]: updated });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <h1 className="title" style={{ textAlign: 'center', marginTop: '1rem' }}>
        QuestLog
      </h1>

      {showWelcome ? (
        <div className="welcome-popup">
          <h2>Welcome to your new journey!</h2>
          <p>Choose your username to begin:</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <button onClick={handleUsernameSubmit}>Start Quest!</button>
        </div>
      ) : (
        userData && (
          <div className="dashboard-flex" style={{ alignItems: 'flex-start' }}>
            {/* Left side: Days + Tasks in horizontal flex */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Day Buttons */}
              <div
                className="left-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                }}
              >
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`day-btn ${selectedDay === day ? 'active' : ''}`}
                    style={{ minWidth: '110px' }}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Unified Task Box */}
              <div
                className="task-box"
                style={{ width: '380px', minHeight: '270px', padding: '1rem' }}
              >
                <h3 style={{ textAlign: 'center', color: '#ffc8ff' }}>
                  {selectedDay}'s Tasks
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a quest..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                    }}
                  />
                  <button
                    onClick={handleAddTask}
                    style={{
                      backgroundColor: '#00f7ff',
                      color: 'black',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      border: 'none',
                      padding: '0.5rem 1rem',
                    }}
                  >
                    Add
                  </button>
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {(tasks[selectedDay] || []).map((task, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.3rem 0',
                        borderBottom: '1px solid #555',
                      }}
                    >
                      <span
                        style={{
                          color: task.done ? '#888' : '#fff',
                          textDecoration: task.done ? 'line-through' : 'none',
                          flex: 1,
                        }}
                      >
                        {task.text}
                      </span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {!task.done && (
                          <button
                            onClick={() => handleComplete(i)}
                            style={{
                              width: '32px',
                              background: '#00f7ff',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            ✔
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(i)}
                          style={{
                            width: '32px',
                            background: '#ff4f4f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ChatGPT AI Button */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <button
                  onClick={toggleAI}
                  style={{
                    marginBottom: '0.5rem',
                    backgroundColor: '#ff6600',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  ChatGPT AI
                </button>
                {showAI && (
                  <div
                    style={{
                      background: '#1c1a36',
                      padding: '1rem',
                      borderRadius: '10px',
                      color: '#fff',
                    }}
                  >
                    <p>Example prompts:</p>
                    <ul>
                      <li>"Suggest 3 tasks for productivity today"</li>
                      <li>"Help me break down this goal..."</li>
                      <li>"What are 5 quests I can do for health?"</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Right: Enemy Zone */}
            <div
              className="enemy-zone"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: 'translateX(60px)',
              }}
            >
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmN2YW44djk3c20yNjc3OW5tbzN2YXoxZ2x2amN3M2IzdXh6bWl4aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6vY4JV7oRVZPems0/giphy.gif"
                alt="Enemy"
                className="enemy-img"
              />
              <div
                className="enemy-hp-bar"
                style={{ marginTop: '1rem', width: '300px' }}
              >
                <div
                  className="enemy-hp-fill"
                  style={{ width: `${(enemyHP / 20) * 100}%` }}
                ></div>
              </div>
              <p style={{ marginTop: '0.5rem' }}>{enemyHP} / 20 HP</p>
              {damageText && <div className="damage-float">{damageText}</div>}
            </div>

            {/* Right: My Stats Panel */}
            <div className="right-panel">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
              <button onClick={toggleStats} className="stats-btn right-btn">
                {myStats ? 'Close Stats' : 'My Stats'}
              </button>
              {myStats && (
                <div className="stats-panel">
                  <h3>My Stats</h3>
                  <p>Username: {userData.username}</p>
                  <p>XP: {userData.xpTotal} / 100</p>
                  <div className="xp-bar">
                    <div
                      className="xp-fill"
                      style={{ width: `${userData.xpTotal % 100}%` }}
                    ></div>
                  </div>
                  <p>Level: {userData.level}</p>
                  <p>Total Tasks Done: {userData.stats.tasksCompleted}</p>
                  <p>Total Damage Done: {userData.stats.totalDamage}</p>
                  <p>
                    Enemies Defeated:{' '}
                    {Math.floor(userData.stats.totalDamage / 20)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
