import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn-sign-in">Sign In</button>
            <a href="#" className="forgot">Forgot Password?</a>
          </form>
        </div>

        <p className="copyright">&copy; 2026 &nbsp;&nbsp; Gordon College — Olongapo City</p>
      </main>

    </div>
  );
}