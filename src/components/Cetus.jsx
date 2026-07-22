import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import BountyModal from './BountyModal';

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

// Static data for Night Cycle Eidolon Hunts
const EIDOLON_BOUNTIES = [
  {
    id: "eidolon_teralyst",
    type: "Eidolon Hunt: Teralyst",
    enemyLevels: [20, 40],
    standingStages: [1000], 
    rewardPoolDrops: []
  },
  {
    id: "eidolon_tridolon",
    type: "Eidolon Cull: Teralyst, Gantulyst, and Hydrolyst",
    enemyLevels: [20, 40],
    standingStages: [5000],
    rewardPoolDrops: []
  }
];

export default function Cetus() {
  const [cetusCycle, setCetusCycle] = useState(null);
  const [bounties, setBounties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBounty, setSelectedBounty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //open a bounty
  const openBountyModal = (bounty) => {
    setSelectedBounty(bounty);
    setIsModalOpen(true);
  }

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
          <span className="text-sm text-slate-200">Ostron Syndicate</span>
        </div>

        {bounties && bounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bounties.map((job, index) => {
              // Calculate total standing for the bounty
              const totalStanding = job.standingStages 
                ? job.standingStages.reduce((a, b) => a + b, 0) 
                : 0;

              return (
                <button onClick={() => openBountyModal(job)} className= "cursor-pointer bg-cyan-900/40 border border-cyan-400 rounded-lg p-5 hover:border-cyan-300 hover:bg-cyan-500/40 hover:scale-103 transition-transform shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100 leading-tight mb-2">
                      {job.type}
                    </h3>
                    <div className="inline-block bg-cyan-800 text-cyan-300 text-xs px-2 py-1 rounded mb-4 font-mono">
                      Level {job.enemyLevels[0]} - {job.enemyLevels[1]}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2">
                    <span className="text-white text-sm">Reputation</span>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded">
                      <span className="text-amber-500 text-xs">✪</span>
                      <span className="font-bold text-amber-400 text-sm">
                        {totalStanding.toLocaleString()}
                      </span>
                    </div>
                  </div>
              </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500">
            No bounties currently available.
          </div>
        )}
      </section>

      {/*Eidolon Hunts Section */}
      {!isDay && (
        <section className="mt-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-300">Sentient Remnants</h2>
            <span className="text-sm text-blue-300">The Quills</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EIDOLON_BOUNTIES.map((job) => {
              const totalStanding = job.standingStages 
                ? job.standingStages.reduce((a, b) => a + b, 0) 
                : 0;

              return (
                <button 
                  key={job.id}
                  onClick={() => openBountyModal(job)} 
                  className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-5 hover:blue-purple-400 hover:bg-blue-900/40 transition-colors shadow-sm flex flex-col justify-between text-left"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-100 leading-tight mb-2">
                      {job.type}
                    </h3>
                    <div className="inline-block bg-blue-900/80 text-blue-300 text-xs px-2 py-1 rounded mb-4 font-mono border border-blue-500/30">
                      Level {job.enemyLevels[0]} - {job.enemyLevels[1]}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-blue-500/20">
                    <span className="text-slate-300 text-sm">Ostron Standing</span>
                    <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded">
                      <span className="font-bold text-blue-300 text-sm">
                        {totalStanding.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    <BountyModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      job={selectedBounty} 
    />
    </div>
  );
}