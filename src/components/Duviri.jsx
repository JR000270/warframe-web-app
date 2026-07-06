import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// The ticking timer component
const Countdown = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiry) return;
    
    const calculateTime = () => {
      const difference = new Date(expiry).getTime() - Date.now();
      
      if (difference <= 0) return "Updating...";
      
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
      if (newTime === "Updating...") clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  return <span className="font-mono tracking-widest">{timeLeft}</span>;
};

export default function Duviri() {
  const [cetusCycle, setCetusCycle] = useState(null);
  const [bounties, setBounties] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'worldState', 'latest');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 1. Set the Cycle Data
        setCetusCycle(data.cetusCycle);

        // 2. Extract Konzu's Bounties
        const allSyndicates = data.syndicateMissions || [];
        const ostronData = allSyndicates.find(
          (syn) => syn.syndicateKey === 'Ostrons'
        );
        
        // Ensure jobs exist before setting them
        if (ostronData && ostronData.jobs) {
          setBounties(ostronData.jobs);
        } else {
          setBounties([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Cetus data...</div>;
  }

  const isDay = cetusCycle?.state === 'day';

  return (
    <div className="w-full max-w-7xl space-y-6">
      
      {/* Dynamic Header / Cycle Banner */}
      <div className={`p-6 rounded-xl border relative overflow-hidden transition-colors duration-500 ${
        isDay 
          ? 'bg-amber-900/20 border-amber-500/30' 
          : 'bg-blue-900/20 border-blue-500/30'
      }`}>
        {/* Background glow effects based on time of day */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isDay ? 'bg-amber-400' : 'bg-blue-500'
        }`}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Cetus</h1>
            <p className="text-slate-400">Plains of Eidolon</p>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold uppercase tracking-wider mb-1 ${
              isDay ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {isDay ? '☀ Day' : '☾ Night'}
            </div>
            <div className="text-slate-300">
              Time remaining: <Countdown expiry={cetusCycle?.expiry} />
            </div>
          </div>
        </div>
      </div>

      {/* Bounty Board Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-200">Konzu's Bounties</h2>
          <span className="text-sm text-slate-400">Ostron Syndicate</span>
        </div>

        {bounties && bounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bounties.map((job, index) => {
              // Calculate total standing for the bounty
              const totalStanding = job.standingStages 
                ? job.standingStages.reduce((a, b) => a + b, 0) 
                : 0;

              return (
                <div 
                  key={job.id || index} 
                  className="bg-slate-900 border border-slate-700 rounded-lg p-5 hover:border-slate-500 transition-colors shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-100 leading-tight mb-2">
                      {job.type}
                    </h3>
                    <div className="inline-block bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded mb-4 font-mono">
                      Level {job.enemyLevels[0]} - {job.enemyLevels[1]}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
                    <span className="text-slate-500 text-sm">Reward</span>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded">
                      <span className="text-amber-500 text-xs">✪</span>
                      <span className="font-bold text-amber-400 text-sm">
                        {totalStanding.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500">
            No bounties currently available.
          </div>
        )}
      </section>

    </div>
  );
}