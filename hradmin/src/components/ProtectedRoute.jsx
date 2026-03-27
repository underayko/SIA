import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔄 Auth state changed:', currentUser?.email);
      
      // Check if user is the admin
      if (currentUser && currentUser.email === 'admin@gordoncollege.edu.ph') {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Not authenticated or not admin - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
}
