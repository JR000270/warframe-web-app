import { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Ensure db (getFirestore) is exported from firebase.js
import { doc, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [messagesRemaining, setMessagesRemaining] = useState(2);
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        
        // Fetch current message usage count
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          const lastReset = data.lastFeedbackReset?.toDate() || new Date(0);
          const now = new Date();
          const hoursPassed = (now - lastReset) / (1000 * 60 * 60);

          if (hoursPassed >= 24) {
            setMessagesRemaining(2);
          } else {
            setMessagesRemaining(Math.max(0, 2 - (data.feedbackCount || 0)));
          }
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please verify the captcha before sending.");
      return;
    }

    setStatus('submitting');

    try {
      // 1. ATOMIC FIRESTORE TRANSACTION CHECK
      const userRef = doc(db, 'users', user.uid);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          // Initialize user doc if first time
          transaction.set(userRef, {
            feedbackCount: 1,
            lastFeedbackReset: serverTimestamp()
          });
        } else {
          const data = userDoc.data();
          const lastReset = data.lastFeedbackReset ? data.lastFeedbackReset.toDate() : new Date(0);
          const now = new Date();
          const hoursPassed = (now - lastReset) / (1000 * 60 * 60);

          if (hoursPassed >= 24) {
            // Reset window
            transaction.update(userRef, {
              feedbackCount: 1,
              lastFeedbackReset: serverTimestamp()
            });
          } else if (data.feedbackCount < 2) {
            // Increment count
            transaction.update(userRef, {
              feedbackCount: data.feedbackCount + 1
            });
          } else {
            throw new Error("DAILY_LIMIT_REACHED");
          }
        }
      });

      // 2. SUBMIT TO WEB3FORMS (Only runs if Firestore transaction succeeds)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '09885e2a-4432-4e29-9331-e882ba7972e2',
          ...formData,
          email: user.email || 'anonymous@warframeapp.com',
          'h-captcha-response': captchaToken
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ subject: '', message: '' });
        setCaptchaToken(null);
        setMessagesRemaining((prev) => prev - 1);
      } else {
        setStatus('error');
      }

    } catch (error) {
      if (error.message === "DAILY_LIMIT_REACHED") {
        alert("Daily limit reached! You can only send 2 transmissions per 24 hours.");
        setStatus('idle');
      } else {
        console.error('Error submitting form:', error);
        setStatus('error');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-cyan-400 font-mono">Authenticating Tenno identity...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-8 animate-fadeIn">
      {/* Header with Remaining Allowance Display */}
      <div className="border p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md bg-linear-to-br from-teal-950/40 via-blue-900/40 to-teal-500/20 border-teal-500/50">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Feedback</h2>
          <p className="text-slate-300">
            Encountered a bug or have a feature request? Send a message over!
          </p>
        </div>
        <div className="text-4xl opacity-50">📡</div>
      </div>

      {/* Form Section */}
      <section className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow-lg">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-2xl font-bold text-teal-400 mb-2">Message Sent</h3>
            <p className="text-slate-300">Thank you for your feedback Tenno.</p>
            <button 
              onClick={() => setStatus('idle')}
              disabled={messagesRemaining <= 0}
              className={`mt-6 px-6 py-2 rounded-lg transition-colors border ${
                messagesRemaining > 0 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600 cursor-pointer' 
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              {messagesRemaining > 0 ? 'Send Another Message' : 'Daily Limit Reached'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Subject */}
            <div className="flex flex-col gap-1">
              <label htmlFor="subject" className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                disabled={messagesRemaining <= 0}
                value={formData.subject}
                onChange={(e) => setFormData(p => ({...p, subject: e.target.value}))}
                placeholder="Bug Report: World Cycle Sync..."
                className="px-4 py-2 w-full bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 backdrop-blur-[2px] disabled:opacity-50"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                Message Data
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="5"
                disabled={messagesRemaining <= 0}
                value={formData.message}
                onChange={(e) => setFormData(p => ({...p, message: e.target.value}))}
                placeholder="Detail your request or report here..."
                className="px-4 py-3 w-full bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 backdrop-blur-[2px] resize-y disabled:opacity-50"
              ></textarea>
            </div>

            {/* HCaptcha */}
            <div className="pt-2">
              <HCaptcha
                sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
                onVerify={(token) => setCaptchaToken(token)}
                theme="dark"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!captchaToken || status === 'submitting' || messagesRemaining <= 0}
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold tracking-widest uppercase transition-all duration-300 border ${
                  !captchaToken || status === 'submitting' || messagesRemaining <= 0
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-teal-900/60 border-teal-500 text-teal-300 hover:bg-teal-800 hover:text-white hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] cursor-pointer'
                }`}
              >
                {status === 'submitting' ? 'Sending...' : messagesRemaining <= 0 ? 'Daily Transmission Limit Reached' : 'Send Message'}
              </button>
            </div>
            
          </form>
        )}
      </section>
    </div>
  );
}