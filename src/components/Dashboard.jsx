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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get XP needed for level
  const getRequiredXP = (level) => {
    return 20 + ((level - 1) * 5); // Level 1: 20, Level 2: 25, Level 3: 30, etc.
  };

  // Get damage based on level
  const getDamagePerTask = (level) => {
    return level * 2; // Level 1: 2 damage, Level 2: 4 damage, Level 3: 6 damage, etc.
  };

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
          else {
            setUsername(data.username);
            
            // Set enemy HP based on level
            // For level 1: 20 HP
            // For level 2: 25 HP
            // For level 3: 30 HP, etc.
            const currentHP = data.currentEnemyHP || (20 + ((data.level || 1) - 1) * 5);
            setEnemyHP(currentHP);
          }
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
    await updateDoc(userRef, { 
      username,
      level: 1,
      xpTotal: 0,
      xpRequired: 20,
      stats: {
        tasksCompleted: 0,
        totalDamage: 0,
        streak: 0
      } 
    });
    setShowWelcome(false);
    setUserData((prev) => ({ 
      ...prev, 
      username,
      level: 1,
      xpTotal: 0,
      xpRequired: 20,
      stats: {
        tasksCompleted: 0,
        totalDamage: 0,
        streak: 0
      } 
    }));
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
      [selectedDay]: [...(tasks[selectedDay] || []), { text: newTask, done: false }],
    };
    setTasks(updated);
    setNewTask('');
  };

  const handleComplete = (index) => {
    const level = userData?.level || 1;
    const damage = getDamagePerTask(level);
    const updatedTasks = tasks[selectedDay].map((t, i) => i === index ? { ...t, done: true } : t);
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
      
      if (newHP <= 0) {
        // Enemy is defeated, award XP
        const xpGain = 20; // Fixed XP per enemy
        const currentXP = userData?.xpTotal || 0;
        const requiredXP = userData?.xpRequired || 20;
        const newTotalXP = currentXP + xpGain;
        
        if (newTotalXP >= requiredXP) {
          // Level up!
          const newLevel = (userData?.level || 1) + 1;
          const newRequiredXP = getRequiredXP(newLevel);
          const xpRemaining = newTotalXP - requiredXP;
          
          setUserData(prev => ({
            ...prev,
            level: newLevel,
            xpTotal: xpRemaining,
            xpRequired: newRequiredXP
          }));
          
          // Update in Firestore (if needed)
          if (auth.currentUser) {
            const uid = auth.currentUser.uid;
            const userRef = doc(db, 'users', uid);
            updateDoc(userRef, {
              level: newLevel,
              xpTotal: xpRemaining,
              xpRequired: newRequiredXP
            });
          }
          
          // Display level up message (you can implement this if needed)
          alert(`Level Up! You are now level ${newLevel}!`);
          
          // New enemy HP based on NEW level (after level up)
          return 20 + ((newLevel - 1) * 5); // Level 1: 20HP, Level 2: 25HP, Level 3: 30HP
        } else {
          // Just update XP
          setUserData(prev => ({
            ...prev,
            xpTotal: newTotalXP
          }));
          
          // Update in Firestore (if needed)
          if (auth.currentUser) {
            const uid = auth.currentUser.uid;
            const userRef = doc(db, 'users', uid);
            updateDoc(userRef, {
              xpTotal: newTotalXP
            });
          }
        }
        
        // Reset enemy with CURRENT level-appropriate HP
        // For Level 1, it should be 20HP
        return 20 + ((userData?.level || 1) - 1) * 5;
      }
      
      return newHP;
    });
  };

  const handleDelete = (index) => {
    const updated = tasks[selectedDay].filter((_, i) => i !== index);
    setTasks({ ...tasks, [selectedDay]: updated });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container" style={{ 
      backgroundColor: '#2b2750', 
      color: 'white',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <style>
      {`
        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #332d61;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #8a7edf;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #9d93e2;
        }
        
        /* Animation for damage text */
        @keyframes float-up {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(-50%, -120%); }
        }
      `}
      </style>

      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 className="title" style={{ 
          fontSize: '2rem',
          color: '#f3d41b',
          margin: 0
        }}>QuestLog</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleAI} 
            style={{ 
              backgroundColor: '#8a7edf',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Chat AI
          </button>
          <button 
            onClick={handleLogout} 
            style={{ 
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {showWelcome ? (
        <div className="welcome-popup" style={{
          backgroundColor: '#3a3363',
          padding: '2rem',
          borderRadius: '10px',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <h2>Welcome to your new journey!</h2>
          <p>Choose your username to begin:</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              width: '100%',
              marginBottom: '1rem',
              border: 'none'
            }}
          />
          <button 
            onClick={handleUsernameSubmit}
            style={{
              backgroundColor: '#4cd3c2',
              color: '#222',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Start Quest!
          </button>
        </div>
      ) : (
        userData && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '200px 1fr 300px',
            gap: '1.5rem',
            height: 'calc(100vh - 100px)'
          }}>
            {/* Day Selection Panel */}
            <div style={{ 
              backgroundColor: '#332d61', 
              borderRadius: '10px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{ 
                    backgroundColor: selectedDay === day ? '#8a7edf' : '#443d82',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Tasks Panel */}
            <div style={{ 
              backgroundColor: '#332d61', 
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ 
                borderBottom: '1px solid #554f86',
                paddingBottom: '0.8rem',
                marginTop: 0,
                marginBottom: '1rem'
              }}>{selectedDay}'s Quests</h2>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new quest..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  style={{ 
                    flex: 1, 
                    padding: '0.7rem',
                    borderRadius: '6px',
                    border: 'none'
                  }}
                />
                <button 
                  onClick={handleAddTask}
                  style={{ 
                    backgroundColor: '#4cd3c2',
                    color: '#222',
                    padding: '0 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ 
                flex: 1,
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 250px)',
                paddingRight: '5px'
              }}>
                {(tasks[selectedDay] || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#8a7edf' }}>
                    No quests added yet. Add your first quest above!
                  </p>
                ) : (
                  <div className="task-list" style={{
                    overflowY: 'auto', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    {(tasks[selectedDay] || []).map((task, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.7rem 1rem',
                        backgroundColor: '#3a3363',
                        borderRadius: '6px',
                        border: '1px solid #443d82'
                      }}>
                        <span style={{ 
                          color: task.done ? '#8a7edf' : 'white', 
                          textDecoration: task.done ? 'line-through' : 'none', 
                          flex: 1 
                        }}>
                          {task.text}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!task.done && (
                            <button 
                              onClick={() => handleComplete(i)}
                              style={{ 
                                backgroundColor: '#4cd3c2',
                                color: '#222',
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ✓
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(i)}
                            style={{ 
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: 'none',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Enemy and Stats */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Enemy Panel - Enlarged and Enhanced */}
              <div style={{ 
                backgroundColor: '#332d61', 
                borderRadius: '10px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  backgroundColor: '#4cd3c2',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  overflow: 'hidden',
                  border: '2px solid #4cd3c2'
                }}>
                  {/* Different enemy images based on level */}
                  {userData.level === 1 && (
                    <img
                      src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmN2YW44djk3c20yNjc3OW5tbzN2YXoxZ2x2amN3M2IzdXh6bWl4aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6vY4JV7oRVZPems0/giphy.gif"
                      alt="Level 1 Enemy"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  {userData.level === 2 && (
                    <img
                      src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaThncWF2ZzUyYm9wZGV1Y2thMzdkeG16eGRuN2JmZ3Fic2c2eWhyNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QVyiT43l46cUcziWxp/giphy.gif"
                      alt="Level 2 Enemy"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  {userData.level >= 3 && (
                    <img
                      src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGo1eXhyZWE4NjZmb3VpaWlhNDBkbTI5eXBnZGhhZHcwajFmeGtsOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JUkHqOky4Np0xyL4k8/giphy.gif"
                      alt="Level 3+ Enemy"
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </div>

                <div style={{ 
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#443d82',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%',
                    width: `${(enemyHP / (20 + ((userData?.level || 1) - 1) * 5)) * 100}%`,
                    backgroundColor: '#e74c3c',
                    transition: 'width 0.3s ease-out'
                  }}></div>
                </div>
                
                <p style={{ marginTop: '0.7rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {enemyHP} / {20 + ((userData?.level || 1) - 1) * 5} HP
                </p>

                {damageText && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#e74c3c',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    animation: 'float-up 1s forwards'
                  }}>
                    {damageText}
                  </div>
                )}
              </div>

              {/* Stats Panel - Reordered and Username added */}
              <div style={{ 
                backgroundColor: '#332d61', 
                borderRadius: '10px',
                padding: '1.5rem',
                marginTop: '1rem'
              }}>
                <h2 style={{ 
                  marginTop: 0,
                  marginBottom: '1rem'
                }}>{userData.username}'s Stats</h2>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.8rem'
                }}>
                  <div>Level</div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {userData.level || 1}
                  </div>
                  
                  <div>XP</div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {userData.xpTotal || 0}/{userData.xpRequired || getRequiredXP(userData.level || 1)}
                  </div>
                  
                  <div>Quests Completed</div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {userData.stats?.tasksCompleted || 0}
                  </div>
                  
                  <div>Current Streak</div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {userData.stats?.streak || 0} days
                  </div>
                  
                  <div>Damage per Quest</div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {getDamagePerTask(userData.level || 1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Enhanced AI Chat Popup */}
      {showAI && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#332d61',
          padding: '1.5rem',
          borderRadius: '10px',
          maxWidth: '350px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 100
        }}>
          <h3 style={{ marginTop: 0, color: '#fff' }}>Chat AI Assistant</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Ask me for quest suggestions:</p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Type your question here..."
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '6px',
                border: 'none',
                minHeight: '80px',
                backgroundColor: '#3a3363',
                color: 'white'
              }}
            />
            <button
              onClick={() => alert("AI suggestion feature coming soon!")}
              style={{
                backgroundColor: '#4cd3c2',
                color: '#222',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                width: '100%',
                marginTop: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Get Suggestions
            </button>
          </div>
          
          <div style={{ backgroundColor: '#3a3363', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0 }}>Try these examples:</p>
            <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>
              <li>"Suggest 3 productivity quests for today"</li>
              <li>"Help me break down my fitness goal"</li>
              <li>"Give me 5 creative quests for the weekend"</li>
            </ul>
          </div>
          
          <button
            onClick={toggleAI}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}