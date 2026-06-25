import { useState } from 'react';
import { signup, login } from '../api';

function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = isLogin
        ? await login(email, password)
        : await signup(email, password);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      onAuthSuccess(user);
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoMark}>F</div>
        <h1 style={styles.title}>Flow</h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Log in to your account' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '28px' }}>
          <label style={styles.label} htmlFor="email">EMAIL</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="password">PASSWORD</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={submitting} style={styles.submitButton}>
            {submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={styles.switchButton}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    padding: '40px 32px',
    textAlign: 'center',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--ink)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '16px',
    margin: '0 auto 20px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    fontWeight: 700,
    margin: 0,
    color: 'var(--ink)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    color: 'var(--ink-soft)',
    fontSize: '14px',
    margin: '6px 0 0',
  },
  label: {
    display: 'block',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--ink-faint)',
    marginBottom: '6px',
    marginTop: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    fontSize: '14px',
    color: 'var(--ink)',
  },
  error: {
    color: 'var(--coral)',
    fontSize: '13px',
    marginTop: '14px',
    marginBottom: 0,
    textAlign: 'left',
    fontWeight: 500,
  },
  submitButton: {
    width: '100%',
    marginTop: '24px',
    padding: '13px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  switchText: {
    marginTop: '24px',
    fontSize: '13.5px',
    color: 'var(--ink-soft)',
  },
  switchButton: {
    border: 'none',
    background: 'none',
    color: 'var(--accent)',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13.5px',
    padding: 0,
  },
};

export default AuthPage;
