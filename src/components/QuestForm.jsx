import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestForm() {
  const [quests, setQuests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedQuestId, setSelectedQuestId] = useState('');
  const [xpTotal, setXpTotal] = useState(0);
  const [level, setLevel] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchUserQuests();
      fetchXP();
      fetchTemplates();
    }
  }, [user]);

  const fetchUserQuests = async () => {
    if (!user) return;
    const q = query(collection(db, 'quests'), where('uid', '==', user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setQuests(data);
  };

  const fetchXP = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const xp = data?.xpTotal || 0;
      setXpTotal(xp);
      setLevel(getLevelFromXP(xp));
    }
  };

  const fetchTemplates = async () => {
    const snapshot = await getDocs(collection(db, 'questTemplates'));
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTemplates(data);
  };

  const handleAcceptQuest = async () => {
    if (!user || !selectedQuestId) return;
    const quest = templates.find((q) => q.id === selectedQuestId);
    if (!quest) return;

    await addDoc(collection(db, 'quests'), {
      title: quest.title,
      xp: quest.xp,
      completed: false,
      uid: user.uid,
      createdAt: Date.now(),
    });

    setSelectedQuestId('');
    fetchUserQuests();
    showToast('Quest added!');
  };

  const handleComplete = async (quest) => {
    if (!user) return;
    const ref = doc(db, 'quests', quest.id);
    await updateDoc(ref, { completed: true });

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const currentXP = snap.data()?.xpTotal || 0;
    const newXP = currentXP + quest.xp;

    const oldLevel = getLevelFromXP(currentXP);
    const newLevel = getLevelFromXP(newXP);

    await updateDoc(userRef, { xpTotal: newXP });

    setXpTotal(newXP);
    setLevel(newLevel);
    fetchUserQuests();

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);

    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
      showToast('You leveled up!');
    } else {
      showToast('Quest completed!');
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'quests', id));
    fetchUserQuests();
    showToast('Quest deleted.');
  };

  const getLevelFromXP = (xp) => {
    if (xp < 20) return 1;
    if (xp < 50) return 2;
    if (xp < 100) return 3;
    return 4;
  };

  const getXPForNextLevel = (level) => {
    if (level === 1) return 20;
    if (level === 2) return 50;
    if (level === 3) return 100;
    return 200;
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <div style={{ position: 'relative', paddingBottom: '2rem' }}>
      <h3>Your Progress</h3>
      <p>Level: {level}</p>
      <p>XP: {xpTotal}</p>
      <progress value={xpTotal} max={getXPForNextLevel(level)} />

      <hr />

      <h3>Select a Quest</h3>
      <select
        value={selectedQuestId}
        onChange={(e) => setSelectedQuestId(e.target.value)}
      >
        <option value="">-- Choose a Quest --</option>
        {templates.map((quest) => (
          <option key={quest.id} value={quest.id}>
            {quest.title} ({quest.xp} XP)
          </option>
        ))}
      </select>
      <button onClick={handleAcceptQuest} disabled={!selectedQuestId}>
        Accept Quest
      </button>

      <h4>Your Quests</h4>
      <ul>
        {quests.map((quest) => (
          <li key={quest.id}>
            {quest.title} - {quest.xp} XP{' '}
            {quest.completed ? (
              <span>✅</span>
            ) : (
              <button onClick={() => handleComplete(quest)}>Complete</button>
            )}
            <button onClick={() => handleDelete(quest.id)}>❌</button>
          </li>
        ))}
      </ul>

      {/* 🎉 Confetti */}
      {showConfetti && <Confetti />}

      {/* 🧙‍♂️ Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              position: 'fixed',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
              fontSize: '2rem',
              zIndex: 999,
            }}
          >
            🎉 Level Up!
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 Toast Message */}
      {toastMsg && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#333',
            color: '#fff',
            padding: '1rem 2rem',
            borderRadius: '6px',
            zIndex: 1000,
          }}
        >
          {toastMsg}
        </motion.div>
      )}
    </div>
  );
}
