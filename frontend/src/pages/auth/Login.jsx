import { useState } from "react";
import gcLogo from "../../assets/gclogo.png";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Source+Sans+3:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gc-green: #1a6b3c;
    --gc-green-dark: #134f2c;
    --gc-green-light: #228b4e;
    --gc-gold: #c9a84c;
    --gc-gold-light: #e8c96b;
    --white: #ffffff;
    --off-white: #f8f7f4;
    --text-dark: #1a1a1a;
    --text-muted: #5a6a5e;
    --border: #dde3df;
  }

  .login-root {
    font-family: 'Source Sans 3', sans-serif;
    min-height: 100vh;
    display: flex;
    background: var(--gc-green-dark);
    overflow-x: hidden;
  }

  /* ── LEFT PANEL ── */
  .login-left {
    width: 55%;
    background: linear-gradient(160deg, var(--gc-green-dark) 0%, var(--gc-green) 50%, #1e5c35 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
    animation: panelIn 0.8s ease both;
  }
  .login-left::before {
    content: '';
    position: absolute;
    top: -120px; right: -120px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: rgba(201,168,76,0.07);
    pointer-events: none;
  }
  .login-left::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }

  .school-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 48px;
    animation: fadeUp 0.7s 0.2s ease both;
  }
  .school-logo-circle {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    overflow: hidden;
  }
  .school-logo-circle img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .school-name h1 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: var(--white);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.3px;
  }
  .school-name p {
    font-size: 12px;
    color: var(--gc-gold-light);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 3px;
    font-weight: 500;
  }

  .divider-gold {
    width: 48px;
    height: 2px;
    background: linear-gradient(90deg, var(--gc-gold), transparent);
    margin-bottom: 40px;
    animation: fadeUp 0.7s 0.3s ease both;
  }

  .system-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.3);
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 32px;
    animation: fadeUp 0.7s 0.32s ease both;
    width: fit-content;
  }
  .system-badge span {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gc-gold-light);
  }
  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--gc-gold);
  }

  .vmg-block {
    margin-bottom: 32px;
    animation: fadeUp 0.7s ease both;
  }
  .vmg-block:nth-child(4) { animation-delay: 0.35s; }
  .vmg-block:nth-child(5) { animation-delay: 0.45s; }
  .vmg-block:nth-child(6) { animation-delay: 0.55s; }

  .vmg-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gc-gold);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vmg-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(201,168,76,0.25);
    max-width: 60px;
  }
  .vmg-text {
    font-size: 14px;
    line-height: 1.75;
    color: rgba(255,255,255,0.85);
    font-weight: 300;
  }
  .goals-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .goals-list li {
    font-size: 13.5px;
    color: rgba(255,255,255,0.82);
    font-weight: 300;
    line-height: 1.5;
    padding-left: 18px;
    position: relative;
  }
  .goals-list li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: var(--gc-gold);
    font-size: 11px;
    top: 2px;
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    width: 45%;
    background: var(--off-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 48px;
    animation: slideIn 0.7s 0.1s ease both;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
  }

  .login-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  }
  .login-logo-img {
    width: 80px; height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: 0 8px 32px rgba(26,107,60,0.2);
    background: #e8f0eb;
    display: flex; align-items: center; justify-content: center;
  }
  .login-logo-img img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .login-logo h2 {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: var(--gc-green-dark);
    font-weight: 600;
    text-align: center;
    line-height: 1.3;
  }
  .login-logo .system-name {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
    font-weight: 600;
    color: var(--gc-green);
  }
  .login-logo .system-full {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
    margin-top: 3px;
    line-height: 1.5;
  }

  .form-title {
    text-align: center;
    margin-bottom: 24px;
  }
  .form-title h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 4px;
  }
  .form-title p { font-size: 13px; color: var(--text-muted); }

  .form-group { margin-bottom: 18px; }
  .form-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 7px;
  }

  /* Employee ID split input */
  .id-input-row {
    display: flex;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--white);
    transition: border-color 0.2s;
  }
  .id-input-row:focus-within { border-color: var(--gc-green); }
  .id-input-row input {
    border: none;
    outline: none;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 14px;
    color: var(--text-dark);
    background: transparent;
    padding: 12px 14px;
    min-width: 0;
    flex: 1;
  }
  .id-input-row input::placeholder { color: #b0bdb5; }
  .id-domain-divider {
    width: 1.5px;
    background: var(--border);
    align-self: stretch;
    flex-shrink: 0;
  }
  .id-domain {
    padding: 12px 14px;
    font-size: 13.5px;
    color: var(--text-muted);
    background: #f4f7f5;
    white-space: nowrap;
    font-family: 'Source Sans 3', sans-serif;
    user-select: none;
    flex-shrink: 0;
  }

  .form-group input[type="password"] {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 14px;
    color: var(--text-dark);
    background: var(--white);
    outline: none;
    transition: border-color 0.2s;
  }
  .form-group input[type="password"]:focus { border-color: var(--gc-green); }
  .form-group input[type="password"]::placeholder { color: #b0bdb5; }

  .error-msg {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #c53030;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 7px;
    margin-bottom: 16px;
    text-align: center;
  }

  .forgot {
    text-align: right;
    margin-top: -10px;
    margin-bottom: 22px;
  }
  .forgot a {
    font-size: 12px;
    color: var(--gc-green);
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }
  .forgot a:hover { text-decoration: underline; }

  .btn-login {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, var(--gc-green), var(--gc-green-light));
    color: var(--white);
    border: none;
    border-radius: 8px;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 16px rgba(26,107,60,0.3);
  }
  .btn-login:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

  .footer-note {
    text-align: center;
    margin-top: 28px;
    font-size: 11.5px;
    color: #a0aca5;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .login-left { width: 45%; padding: 48px 36px; }
    .login-right { width: 55%; padding: 48px 36px; }
    .vmg-text { font-size: 13px; }
  }

  @media (max-width: 640px) {
    .login-root { flex-direction: column; overflow-y: auto; }
    .login-right {
      width: 100%;
      padding: 40px 24px 36px;
      order: 1;
    }
    .login-left {
      width: 100%;
      padding: 32px 24px 40px;
      justify-content: flex-start;
      order: 2;
    }
    .login-card { max-width: 100%; }
    .login-logo-img { width: 64px; height: 64px; }
    .login-logo h2 { font-size: 16px; }
    .school-header { margin-bottom: 24px; }
    .school-name h1 { font-size: 17px; }
    .school-logo-circle { width: 48px; height: 48px; font-size: 22px; }
    .divider-gold { margin-bottom: 24px; }
    .vmg-block { margin-bottom: 20px; }
    .vmg-text { font-size: 13px; }
    .goals-list li { font-size: 12.5px; }
    .id-domain { font-size: 12px; padding: 12px 10px; }
  }

  @keyframes panelIn {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function Login({ onLogin }) {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fullEmail = `${employeeId}@gordoncollege.edu.ph`;

    const handleLogin = async () => {
        setError("");
        if (!employeeId || !password) {
            setError("Please enter your Employee ID and password.");
            return;
        }
        setLoading(true);
        try {
            // TODO: connect Firebase
            // import { signInWithEmailAndPassword } from "firebase/auth";
            // import { auth } from "../../firebase/auth";
            // const { user } = await signInWithEmailAndPassword(auth, fullEmail, password);
            // if (onLogin) onLogin(user);
            console.log("Logging in as:", fullEmail);
        } catch (err) {
            setError("Invalid Employee ID or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <>
            <style>{styles}</style>
            <div className="login-root">
                {/* LEFT — Vision / Mission / Core Values */}
                <div className="login-left">
                    <div className="school-header">
                        <div className="school-logo-circle">🎓</div>
                        <div className="school-name">
                            <h1>Gordon College</h1>
                            <p>Olongapo City</p>
                        </div>
                    </div>

                    <div className="divider-gold" />

                    <div className="system-badge">
                        <div className="badge-dot" />
                        <span>GCFARES</span>
                    </div>

                    <div className="vmg-block">
                        <div className="vmg-label">Vision</div>
                        <p className="vmg-text">
                            A globally recognized local institution committed to
                            innovative academic excellence, holistic and
                            sustainable development, inclusivity, and community
                            engagement.
                        </p>
                    </div>

                    <div className="vmg-block">
                        <div className="vmg-label">Mission</div>
                        <p className="vmg-text">
                            Produce empowered global citizens who create
                            sustainable impact, uphold values of character,
                            excellence, and service, and contribute to academic
                            and societal development.
                        </p>
                    </div>

                    <div className="vmg-block">
                        <div className="vmg-label">Core Values</div>
                        <ul className="goals-list">
                            <li>
                                <strong>Character</strong> — integrity,
                                responsibility, and lifelong learning
                            </li>
                            <li>
                                <strong>Excellence</strong> — intellectual
                                curiosity, innovation, and academic rigor
                            </li>
                            <li>
                                <strong>Service</strong> — community impact and
                                social responsibility
                            </li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT — Login Form */}
                <div className="login-right">
                    <div className="login-card">
                        <div className="login-logo">
                            <div className="login-logo-img">
                                <img src={gcLogo} alt="Gordon College" />
                            </div>
                            <h2>Gordon College</h2>
                            <span className="system-name">GCFARES</span>
                            <span className="system-full">
                                Faculty Advancement &amp; Ranking Evaluation
                                System
                            </span>
                        </div>

                        <div className="form-title">
                            <p>Enter your credentials to continue</p>
                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <div className="form-group">
                            <label>Employee ID Number</label>
                            <div className="id-input-row">
                                <input
                                    type="text"
                                    placeholder="e.g 202011111"
                                    value={employeeId}
                                    onChange={(e) =>
                                        setEmployeeId(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    maxLength={20}
                                    autoComplete="off"
                                />
                                <div className="id-domain-divider" />
                                <div className="id-domain">
                                    @gordoncollege.edu.ph
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="forgot">
                            <a>Forgot Password?</a>
                        </div>

                        <button
                            className="btn-login"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        <p className="footer-note">
                            © 2026 Gordon College. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
