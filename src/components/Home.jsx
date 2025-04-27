import { useNavigate } from 'react-router-dom';
import { FaGamepad, FaTasks, FaRocket, FaChartLine } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  const handleTryNow = () => {
    navigate('/login');
  };

  return (
    <div className="page-container">
      <h1>
        <FaGamepad style={{ color: '#00f7ff' }} />{' '}
        <span style={{ color: '#ffffff' }}>QuestLog</span>
      </h1>
      <h2>
        <strong className="gradient-text">Gamify Your Life.</strong>
      </h2>
      <p>
        Turn boring real-life tasks into epic quests. Earn XP, level up, and
        stay productive like a true RPG hero.
      </p>

      <img
        src="https://firebasestorage.googleapis.com/v0/b/questlog-efae2.firebasestorage.app/o/QuestLog-ezgif.com-resize.gif?alt=media&token=af857572-9711-433e-b719-1326302c0483"
        alt="QuestLog Level Up"
        style={{
          width: '260px',
          borderRadius: '10px',
          marginTop: '1.5rem',
          boxShadow: '0 0 15px rgba(0,0,0,0.4)',
        }}
      />

      <button className="play-button" onClick={handleTryNow}>
        <FaGamepad /> Play Now
      </button>

      <h3>Features</h3>
      <div className="feature-icons">
        <div className="feature-tile">
          <FaTasks size={28} style={{ color: '#ffc107' }} />
          <p>📋 Track Quests</p>
        </div>
        <div className="feature-tile">
          <FaChartLine size={28} style={{ color: '#17d4ff' }} />
          <p>📈 Level Up</p>
        </div>
        <div className="feature-tile">
          <FaRocket size={28} style={{ color: '#ff6f61' }} />
          <p>🚀 Boost Productivity</p>
        </div>
      </div>

      <p className="auth-links">
        Already have an account? <a href="/login">Login</a> |{' '}
        <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
}
