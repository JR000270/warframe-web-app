import { useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Support() {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const [captchaToken, setCaptchaToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Example using Web3Forms (Free, no account required, just get an Access Key)
      // Alternatively, you can use Formspree or EmailJS here
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: '09885e2a-4432-4e29-9331-e882ba7972e2', // Replace with your key
          ...formData,
          'hcaptcha_token-response': captchaToken
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({email: '', subject: '', message: '' }); // Clear form
        setCaptchaToken(null); // Reset captcha
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md bg-gradient-to-br from-teal-950/40 via-blue-900/40 to-teal-500/20 border-teal-500/50">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Transmissions</h2>
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
            <span className="text-5xl mb-4">✅</span>
            <h3 className="text-2xl font-bold text-teal-400 mb-2">Transmission Sent</h3>
            <p className="text-slate-300">Thank you for your feedback Tenno.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-600"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                  Return Address (Email)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="px-4 py-2 w-full bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 backdrop-blur-[2px]"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="subject" className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="Bug Report: World Cycle Sync..."
                className="px-4 py-2 w-full bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 backdrop-blur-[2px]"
              />
            </div>

            {/* Message Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                Message Data
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Detail your request or report here..."
                className="px-4 py-3 w-full bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 backdrop-blur-[2px] resize-y"
              ></textarea>
            </div>

            {/* HCaptcha */}
            <div className="pt-2">
              <HCaptcha
                sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
                onVerify={(token) => setCaptchaToken(token)}
                theme="dark" // Matches your high-tech aesthetic!
              />
            </div>
            {/* Error Message Display */}
            {status === 'error' && (
              <p className="text-red-400 text-sm font-bold bg-red-900/20 p-2 rounded border border-red-500/50">
                Failed to send transmission. Please try again.
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold tracking-widest uppercase transition-all duration-300 border ${
                  status === 'submitting' 
                    ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-900/60 border-teal-500 text-teal-300 hover:bg-teal-800 hover:text-white hover:shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                }`}
              >
                {status === 'submitting' ? 'Transmitting...' : 'Send Transmission'}
              </button>
            </div>
            
          </form>
        )}
      </section>
    </div>
  );
}