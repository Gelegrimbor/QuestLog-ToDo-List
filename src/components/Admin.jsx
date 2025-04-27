import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [quests, setQuests] = useState([]);
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  // Fetch all quests
  const fetchQuests = async () => {
    const snapshot = await getDocs(collection(db, 'quests'));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setQuests(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchQuests();

    // Optional: Real-time update
    const unsub = onSnapshot(collection(db, 'quests'), () => {
      fetchQuests();
    });

    return () => unsub();
  }, []);

  const handleDeleteQuest = async (id) => {
    await deleteDoc(doc(db, 'quests', id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const switchToUserView = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>🛠 Admin Panel</h2>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={switchToUserView}>Switch to User View</button>

      <h3>👥 All Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} {user.isAdmin && '(Admin)'}
          </li>
        ))}
      </ul>

      <h3>📜 All Quests</h3>
      <ul>
        {quests.map((quest) => (
          <li key={quest.id}>
            <strong>{quest.title}</strong> - {quest.xp} XP ({quest.uid})
            <button onClick={() => handleDeleteQuest(quest.id)}>
              ❌ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
