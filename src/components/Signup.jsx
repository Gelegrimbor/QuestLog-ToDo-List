import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: '',
        xpTotal: 0,
        level: 1,
        stats: { tasksCompleted: 0, totalDamage: 0 },
        isAdmin: false,
      });

      toast.success('Signup successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="gradient-text">Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign Up</button>
      </form>
      <p style={{ marginTop: '1rem' }}>Already have an account? <a href="/login">Login</a></p>
      <button onClick={() => navigate('/')} style={{ marginTop: '1rem', backgroundColor: '#00f7ff', color: 'black', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>← Back to Home</button>
    </div>
  );
}


