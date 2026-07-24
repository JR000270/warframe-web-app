import { useState } from 'react';
import { auth } from '../firebase';
import pageBg from '../images/warframe_content_page_background.png';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  //Holding the user's typed input and UI status
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Sign Up mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //submit function
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the browser from refreshing the page on submit
    setError(''); // Clear any old errors

    try {
      if (isLogin) {
        // Try to log the user in
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/'); // Redirect to dashboard after login
      } else {
        // Try to create a brand new account
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/'); // Redirect to dashboard after sign up
      }
    } catch (err) {
      // If Firebase rejects the attempt (e.g. wrong password), display the error
      setError(err.message);
    }
  };


  return (
    
      <div className="w-full max-w-md mx-auto mt-12 sm:mt-20 px-6 sm:px-8 py-8 space-y-5 bg-cyan-900/20 rounded-xl border border-cyan-700 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-cyan-400">
          {isLogin ? 'Log In' : 'Create an Account'}
        </h2>
        {/* If there's an error, show a red alert box */}
        {error && <div className="p-3 text-sm text-cyan-400 bg-cyan-900/30 rounded border border-cyan-800">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state on every keystroke
              className="w-full px-4 py-2 mt-1 text-white bg-slate-900 border border-slate-600 rounded focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-white bg-slate-900 border border-slate-600 rounded focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2 font-bold text-white bg-cyan-600 rounded hover:bg-cyan-700 transition-colors"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Button */}
        <p className="text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
  );
}