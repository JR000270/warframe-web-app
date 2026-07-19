import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

// Upgraded Countdown to accept custom completion text[cite: 8]
const Countdown = ({ targetTime, completeText }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetTime) return;
    const calculateTime = () => {
      const difference = new Date(targetTime).getTime() - Date.now();
      if (difference <= 0) return completeText;
      
      const h = Math.floor(difference / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      if (h > 0) return `${h}h ${m}m ${s}s`;
      return `${m}m ${s}s`;
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      const newTime = calculateTime();
      setTimeLeft(newTime);
      if (newTime === completeText) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, completeText]);

  return <span className="font-mono font-bold text-yellow-400">{timeLeft}</span>;
};

export default function Baro() {
  const [trader, setTrader] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 1. New search state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const docRef = doc(db, 'worldState', 'latest');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTrader(data.voidTrader || null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-8">Loading Void Manifest...</div>;
  
  // Hard failsafe if database is totally empty[cite: 8]
  if (!trader) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
        <Link to="/" className="text-sm text-slate-400 hover:text-red-400 transition-colors">← Back to Active System Monitors</Link>
        <div className="bg-slate-900 p-8 border border-slate-800 rounded-lg text-center text-slate-400">
          Awaiting Void Trader telemetry...
        </div>
      </div>
    );
  }

  // Calculate if he is actively trading right now using raw timestamps[cite: 8]
  const now = Date.now();
  const activationTime = new Date(trader.activation).getTime();
  const expiryTime = new Date(trader.expiry).getTime();
  
  const isBaroActive = now >= activationTime && now < expiryTime;

  // 2. Filter inventory based on search query
  const filteredInventory = (trader.inventory || []).filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl p-4 space-y-8 animate-fadeIn">
      
      {/* Hero Header - Changes style based on active status[cite: 8] */}
      <div className={`border p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md transition-colors ${
        isBaroActive 
          ? 'bg-gradient-to-br from-teal-950/40 via-blue-900 to-teal-500 border-teal-500' 
          : 'bg-cyan-900/40 border-cyan-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Baro Ki'Teer</h2>
          </div>
          {isBaroActive ? (
            <p className="text-slate-300">
              Stationed at location: <span className="text-teal-300 font-bold">{trader.location}</span>
            </p>
          ) : (
            <p className="text-white">Traveling through the Void...</p>
          )}
        </div>

        {/* Countdown Box[cite: 8] */}
        <div className="bg-cyan-900/40 p-4 rounded-lg w-full md:w-64 text-center">
          <p className="text-xs uppercase tracking-widest text-white mb-1 font-bold">
            {isBaroActive ? 'Trading Closes In' : 'Next Arrival In'}
          </p>
          <div className="text-2xl">
            {isBaroActive ? (
              <Countdown targetTime={trader.expiry} completeText="Departed" />
            ) : (
              <Countdown targetTime={trader.activation} completeText="Arrived" />
            )}
          </div>
        </div>
      </div>

      {/* Conditional Content Rendering[cite: 8] */}
      {isBaroActive ? (
        <section>
          {/* Header & Search Bar Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-1">
            <h3 className="text-xl font-bold text-slate-200">
              Exquisite Wares ({filteredInventory.length})
            </h3>
            
            {/* 3. The Interactive Search Input */}
            <input
              type="text"
              placeholder="Filter items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-full md:w-64 bg-cyan-950/20 border border-cyan-500/40 rounded-lg text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:border-cyan-400 transition-all duration-300 backdrop-blur-[2px]"
            />
          </div>
          
          {!trader.inventory || trader.inventory.length === 0 ? (
            <p className="text-red-400 italic">Inventory list empty or out of sync.</p>
          ) : filteredInventory.length === 0 ? (
            // Custom state if search query returns zero results
            <p className="text-slate-500 italic px-1 py-4">No wares match your search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Map over filtered items instead of raw trader.inventory */}
              {filteredInventory.map((item, index) => (
                <div 
                  key={`${item.item}-${index}`} 
                  className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 hover:border-slate-700 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    <h4 className="font-bold text-white text-base tracking-tight line-clamp-2 mb-2">
                      {item.item}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal-400 font-bold text-xs bg-teal-500/10 px-1.5 py-0.5 rounded">Ducats</span>
                      <span className="font-semibold text-slate-200">{item.ducats.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-500 font-bold text-xs bg-yellow-500/10 px-1.5 py-0.5 rounded">Credits</span>
                      <span className="font-semibold text-slate-200">{item.credits.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center py-20 px-4 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/30">
          <span className="text-4xl mb-4 opacity-50">⏳</span>
          <h3 className="text-2xl font-bold text-slate-300 mb-2">Check back soon</h3>
          <p className="text-slate-400 max-w-md">
            Baro Ki'Teer is currently scouring the Void for new astounding wares. His inventory will be revealed when he docks at the Relay.
          </p>
        </section>
      )}
      
    </div>
  );
}