import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, check if we already have a token saved
    const token = localStorage.getItem('token');
    if (token) {
      // We have a token, but we don't actually know who the user is
      // without asking the backend. For now, we'll just trust it exists
      // and treat the user as logged in. We'll refine this later if needed.
      setUser({ loggedIn: true });
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

 return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div>
        {user ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
export default App;
