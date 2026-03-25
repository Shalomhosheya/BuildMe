import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --font-display: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;

    --surface: #ffffff;
    --surface-raised: #fafafa;
    --bg: #f5f4f1;
    --border: #e8e6e1;
    --border-md: #d4d0c8;

    --text-primary: #1a1916;
    --text-secondary: #6b6860;
    --text-tertiary: #9e9b95;

    --purple: #6c5ce7;
    --purple-light: #ede9fc;
    --purple-dark: #4a3dbf;
    --purple-muted: #f3f1fd;

    --teal: #00b894;
    --teal-light: #e0f8f3;

    --amber: #e6a817;
    --amber-light: #fef6e0;

    --gray-100: #f2f1ee;
    --gray-200: #e6e4de;

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;

    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
  }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .auth-root {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }

  /* LEFT PANEL */
  .panel-left {
    width: 420px;
    flex-shrink: 0;
    background: var(--text-primary);
    padding: 48px 44px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .panel-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 20% 80%, rgba(108,92,231,0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(0,184,148,0.12) 0%, transparent 55%);
    pointer-events: none;
  }
  .panel-left-inner { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; }

  .brand-mark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 56px;
  }
  .brand-icon {
    width: 34px; height: 34px;
    background: var(--purple);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .brand-icon svg { width: 18px; height: 18px; color: #fff; }
  .brand-name {
    font-family: var(--font-display);
    font-size: 20px;
    color: #ffffff;
    letter-spacing: -0.3px;
  }

  .left-headline {
    font-family: var(--font-display);
    font-size: 38px;
    font-weight: 400;
    color: #ffffff;
    line-height: 1.15;
    letter-spacing: -0.8px;
    margin-bottom: 18px;
    animation: fadeUp 0.6s ease both;
  }
  .left-headline em { font-style: italic; color: #a89cf7; }

  .left-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
    margin-bottom: 44px;
    animation: fadeUp 0.6s ease 0.08s both;
  }

  .stat-pills {
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeUp 0.6s ease 0.14s both;
  }
  .stat-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-md);
    padding: 13px 16px;
    backdrop-filter: blur(8px);
  }
  .stat-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .stat-pill-text { font-size: 13px; color: rgba(255,255,255,0.75); flex: 1; }
  .stat-pill-val { font-size: 13px; font-weight: 500; color: #fff; }

  .left-footer {
    margin-top: auto;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    animation: fadeUp 0.6s ease 0.22s both;
  }

  /* RIGHT PANEL */
  .panel-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
  }

  .form-card {
    width: 100%;
    max-width: 420px;
  }

  .form-heading {
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 400;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
    color: var(--text-primary);
  }
  .form-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 32px;
    line-height: 1.6;
  }
  .form-sub span {
    color: var(--purple);
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .tab-switcher {
    display: flex;
    background: var(--gray-100);
    border-radius: var(--radius-md);
    padding: 4px;
    margin-bottom: 28px;
    gap: 4px;
  }
  .tab-btn {
    flex: 1;
    padding: 9px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .tab-btn.active {
    background: var(--surface);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }

  .fields { display: flex; flex-direction: column; gap: 14px; }

  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.2px;
  }
  .field-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field-input:focus {
    border-color: var(--purple);
    box-shadow: 0 0 0 3px rgba(108,92,231,0.12);
  }
  .field-input::placeholder { color: var(--text-tertiary); }
  .field-input.error { border-color: #e17055; box-shadow: 0 0 0 3px rgba(225,112,85,0.1); }

  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .error-msg { font-size: 11px; color: #e17055; margin-top: 2px; }

  .field-hint {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-top: 3px;
  }

  .password-wrap { position: relative; }
  .password-wrap .field-input { padding-right: 42px; }
  .eye-btn {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    color: var(--text-tertiary);
    padding: 2px;
    display: flex; align-items: center;
    transition: color 0.15s;
  }
  .eye-btn:hover { color: var(--text-secondary); }

  .forgot-link {
    display: flex;
    justify-content: flex-end;
    margin-top: -6px;
  }
  .forgot-link a {
    font-size: 12px;
    color: var(--purple);
    text-decoration: none;
    font-weight: 500;
  }
  .forgot-link a:hover { text-decoration: underline; text-underline-offset: 2px; }

  .terms-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 2px;
  }
  .terms-checkbox {
    width: 16px; height: 16px;
    margin-top: 1px;
    accent-color: var(--purple);
    cursor: pointer;
    flex-shrink: 0;
  }
  .terms-text {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .terms-text a { color: var(--purple); text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }

  .submit-btn {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--purple);
    color: #ffffff;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 2px 12px rgba(108,92,231,0.3);
    position: relative;
    overflow: hidden;
  }
  .submit-btn:hover {
    background: var(--purple-dark);
    box-shadow: 0 4px 20px rgba(108,92,231,0.4);
    transform: translateY(-1px);
  }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn.loading {
    background: linear-gradient(90deg, var(--purple), #a089f5, var(--purple));
    background-size: 200% auto;
    animation: shimmer 1.5s linear infinite;
    pointer-events: none;
  }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 18px 0;
    font-size: 12px;
    color: var(--text-tertiary);
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  .oauth-btn {
    width: 100%;
    padding: 11px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .oauth-btn:hover {
    border-color: var(--border-md);
    background: var(--gray-100);
    box-shadow: var(--shadow-sm);
  }

  .slide-in-left  { animation: slideLeft  0.28s ease both; }
  .slide-in-right { animation: slideRight 0.28s ease both; }

  .success-state {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 16px; padding: 20px 0;
    animation: fadeUp 0.5s ease both;
  }
  .success-icon {
    width: 56px; height: 56px;
    background: var(--teal-light);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--teal);
    font-size: 26px;
  }
  .success-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 400;
    letter-spacing: -0.4px;
  }
  .success-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.6; max-width: 300px; }

  .badge-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 500;
    padding: 4px 10px; border-radius: 20px;
  }

  @media (max-width: 720px) {
    .panel-left { display: none; }
    .panel-right { padding: 32px 24px; }
  }
`;

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function AuthForm() {
  const [tab, setTab] = useState("signin");
  const [prevTab, setPrevTab] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  const [signinFields, setSigninFields] = useState({ email: "", password: "" });
  const [signupFields, setSignupFields] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });

  const switchTab = (t) => {
    setPrevTab(tab);
    setTab(t);
    setErrors({});
    setSuccess(false);
  };

  const validate = () => {
    const e = {};
    if (tab === "signin") {
      if (!signinFields.email.includes("@")) e.email = "Enter a valid email";
      if (signinFields.password.length < 6) e.password = "Password too short";
    } else {
      if (!signupFields.firstName.trim()) e.firstName = "Required";
      if (!signupFields.lastName.trim()) e.lastName = "Required";
      if (!signupFields.email.includes("@")) e.email = "Enter a valid email";
      if (signupFields.password.length < 8) e.password = "Min 8 characters";
      if (signupFields.password !== signupFields.confirm) e.confirm = "Passwords don't match";
      if (!agreed) e.terms = "Please accept the terms";
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1600);
  };

  const animClass = prevTab === null ? "" : tab === "signup" ? "slide-in-left" : "slide-in-right";

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        {/* LEFT */}
        <div className="panel-left">
          <div className="panel-left-inner">
            <div className="brand-mark">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <span className="brand-name">IELTSPro</span>
            </div>

            <h2 className="left-headline">
              Your path to<br /><em>band 7+</em><br />starts here.
            </h2>
            <p className="left-sub">
              Adaptive quizzes, AI-powered feedback, and skill tracking designed to get you exam-ready — faster.
            </p>

            <div className="stat-pills">
              {[
                { dot: "#6c5ce7", text: "Skill-based adaptive learning", val: "4 modules" },
                { dot: "#00b894", text: "AI essay scoring & feedback", val: "Instant" },
                { dot: "#e6a817", text: "Average band improvement", val: "+1.5 bands" },
                { dot: "#a29bfe", text: "Readiness certificate on completion", val: "Verified" },
              ].map((s, i) => (
                <div key={i} className="stat-pill" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                  <div className="stat-dot" style={{ background: s.dot }} />
                  <span className="stat-pill-text">{s.text}</span>
                  <span className="stat-pill-val">{s.val}</span>
                </div>
              ))}
            </div>

            <div className="left-footer">
              Trusted by 12,000+ IELTS candidates worldwide
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="panel-right">
          <div className={`form-card ${animClass}`}>
            {success ? (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <div className="success-title">
                  {tab === "signin" ? "Welcome back!" : "Account created!"}
                </div>
                <p className="success-sub">
                  {tab === "signin"
                    ? "You're signed in. Redirecting to your dashboard…"
                    : "Your account is ready. Let's get you to band 7+."}
                </p>
                <div className="badge-row">
                  <span className="badge" style={{ background: "var(--amber-light)", color: "var(--amber)" }}>🔥 Start your streak today</span>
                  {tab === "signup" && <span className="badge" style={{ background: "var(--purple-light)", color: "var(--purple-dark)" }}>Builder badge unlocked</span>}
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 28 }}>
                  <h1 className="form-heading">
                    {tab === "signin" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="form-sub">
                    {tab === "signin" ? (
                      <>New here? <span onClick={() => switchTab("signup")}>Create a free account</span></>
                    ) : (
                      <>Already have an account? <span onClick={() => switchTab("signin")}>Sign in</span></>
                    )}
                  </p>
                </div>

                <div className="tab-switcher">
                  <button className={`tab-btn ${tab === "signin" ? "active" : ""}`} onClick={() => switchTab("signin")}>Sign in</button>
                  <button className={`tab-btn ${tab === "signup" ? "active" : ""}`} onClick={() => switchTab("signup")}>Sign up</button>
                </div>

                <div className="fields">
                  {tab === "signup" && (
                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">First name</label>
                        <input className={`field-input ${errors.firstName ? "error" : ""}`}
                          placeholder="Ahmad"
                          value={signupFields.firstName}
                          onChange={e => setSignupFields(p => ({ ...p, firstName: e.target.value }))} />
                        {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                      </div>
                      <div className="field-group">
                        <label className="field-label">Last name</label>
                        <input className={`field-input ${errors.lastName ? "error" : ""}`}
                          placeholder="Al-Rashid"
                          value={signupFields.lastName}
                          onChange={e => setSignupFields(p => ({ ...p, lastName: e.target.value }))} />
                        {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                      </div>
                    </div>
                  )}

                  <div className="field-group">
                    <label className="field-label">Email address</label>
                    <input
                      className={`field-input ${errors.email ? "error" : ""}`}
                      type="email"
                      placeholder="you@example.com"
                      value={tab === "signin" ? signinFields.email : signupFields.email}
                      onChange={e => tab === "signin"
                        ? setSigninFields(p => ({ ...p, email: e.target.value }))
                        : setSignupFields(p => ({ ...p, email: e.target.value }))} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Password</label>
                    <div className="password-wrap">
                      <input
                        className={`field-input ${errors.password ? "error" : ""}`}
                        type={showPass ? "text" : "password"}
                        placeholder={tab === "signup" ? "Min 8 characters" : "Your password"}
                        value={tab === "signin" ? signinFields.password : signupFields.password}
                        onChange={e => tab === "signin"
                          ? setSigninFields(p => ({ ...p, password: e.target.value }))
                          : setSignupFields(p => ({ ...p, password: e.target.value }))} />
                      <button className="eye-btn" onClick={() => setShowPass(v => !v)} type="button">
                        <EyeIcon open={showPass} />
                      </button>
                    </div>
                    {errors.password && <span className="error-msg">{errors.password}</span>}
                    {tab === "signup" && !errors.password && signupFields.password.length > 0 && (
                      <div className="field-hint">
                        Strength: {signupFields.password.length < 8 ? "⚠️ Too short" : signupFields.password.length < 12 ? "🟡 Fair" : "🟢 Strong"}
                      </div>
                    )}
                  </div>

                  {tab === "signup" && (
                    <div className="field-group">
                      <label className="field-label">Confirm password</label>
                      <div className="password-wrap">
                        <input
                          className={`field-input ${errors.confirm ? "error" : ""}`}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat password"
                          value={signupFields.confirm}
                          onChange={e => setSignupFields(p => ({ ...p, confirm: e.target.value }))} />
                        <button className="eye-btn" onClick={() => setShowConfirm(v => !v)} type="button">
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                      {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
                    </div>
                  )}

                  {tab === "signin" && (
                    <div className="forgot-link">
                      <a href="#">Forgot password?</a>
                    </div>
                  )}

                  {tab === "signup" && (
                    <div className="terms-row">
                      <input type="checkbox" className="terms-checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                      <span className="terms-text">
                        I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                        {errors.terms && <><br /><span style={{ color: "#e17055" }}>{errors.terms}</span></>}
                      </span>
                    </div>
                  )}

                  <button className={`submit-btn ${loading ? "loading" : ""}`} onClick={handleSubmit}>
                    {loading ? "Please wait…" : tab === "signin" ? "Sign in to dashboard" : "Create my account"}
                  </button>

                  <div className="divider">or continue with</div>

                  <button className="oauth-btn">
                    <GoogleIcon /> Sign {tab === "signin" ? "in" : "up"} with Google
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}