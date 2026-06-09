import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for login/logout events
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-900 text-white pt-10 px-4">
      
      {/* Header with Logout Button */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-red-500">
          Warframe Alert Hub
        </h1>
        {user && (
          <button 
            onClick={() => signOut(auth)}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded hover:bg-slate-800 transition-colors"
          >
            Log Out
          </button>
        )}
      </div>
      
      {/* The Bouncer Logic: If user exists, show Dashboard. If not, show Login. */}
      {user ? <Dashboard /> : <Login />}
      
    </div>
  )
}

export default App;