import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
=======
  const [error, setError] = useState('');
  const navigate = useNavigate();
>>>>>>> 6c9ccdd57ad8c4fa37a05722770ab6e658c1d005

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
<<<<<<< HEAD
    setLoading(true);

    try {
      // Admin-only validation
      if (email !== 'admin@gordoncollege.edu.ph') {
        throw new Error('Access denied. Only admin accounts are allowed.');
      }

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Additional admin verification
      if (user.email !== 'admin@gordoncollege.edu.ph') {
        throw new Error('Access denied. Only admin accounts are allowed.');
      }
      console.log('✅ Admin login successful:', user.email);
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);
      if (err.message.includes('Access denied')) {
        setError(err.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
=======
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await response.json();
      // Optionally store token: localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
>>>>>>> 6c9ccdd57ad8c4fa37a05722770ab6e658c1d005
    }
  };

  return (
    <div className="split">

      <aside className="login-left">
        <div className="left-content">

          <div className="login-section">
            <div className="section-label">Vision</div>
            <p>
              A globally recognized local institution committed to innovative academic
              excellence, holistic and sustainable development, inclusivity, and community
              engagement.
            </p>
          </div>

          <div className="login-divider" />

          <div className="login-section">
            <div className="section-label">Mission</div>
            <p>
              Produce empowered global citizens who create sustainable impact, uphold
              values of character, excellence, and service, and contribute to academic
              and societal development.
            </p>
          </div>

          <div className="login-divider" />

          <div className="login-section">
            <div className="section-label">Core Values</div>
            <ul className="core-values">
              <li>Character — integrity, responsibility, and lifelong learning</li>
              <li>Excellence — intellectual curiosity, innovation, and academic rigor</li>
              <li>Service — community impact and social responsibility</li>
            </ul>
          </div>

        </div>
      </aside>

      <main className="login-right">
        <div className="brand">
          <h2>Faculty Evaluation System</h2>
          <p>HR Admin Portal</p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email" id="email"
                placeholder="admin@gordoncollege.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password" id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
<<<<<<< HEAD
            <button type="submit" className="btn-sign-in" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            {error && <p className="login-error">{error}</p>}
=======
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn-sign-in">Sign In</button>
>>>>>>> 6c9ccdd57ad8c4fa37a05722770ab6e658c1d005
            <a href="#" className="forgot">Forgot Password?</a>
          </form>
        </div>

        <p className="copyright">&copy; 2026 &nbsp;&nbsp; Gordon College — Olongapo City</p>
      </main>

    </div>
  );
}