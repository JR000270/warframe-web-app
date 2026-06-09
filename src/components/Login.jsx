import { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export default function Login() {
  //Holding the user's typed input and UI status
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Sign Up mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  //submit function
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from refreshing the page on submit
    setError(''); // Clear any old errors

    try {
      if (isLogin) {
        // Try to log the user in
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Try to create a brand new account
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      // If Firebase rejects the attempt (e.g. wrong password), display the error
      setError(err.message);
    }
  };

  //UI html
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center text-red-500">
        {isLogin ? 'Log In to Alerts' : 'Create an Account'}
      </h2>

      {/* If there's an error, show a red alert box */}
      {error && <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded border border-red-800">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update state on every keystroke
            className="w-full px-4 py-2 mt-1 text-white bg-slate-900 border border-slate-600 rounded focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-1 text-white bg-slate-900 border border-slate-600 rounded focus:border-red-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-2 font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      {/* Toggle Button */}
      <p className="text-center text-sm text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-red-400 hover:text-red-300 underline"
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}