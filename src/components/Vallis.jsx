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

  const PROFIT_TAKER_HEISTS = 
  [
    {
      id: "profit_taker_phase_1",
      type: "Profit Taker: Phase 1",
      enemyLevels: [40, 60],
      standingStages: [1000],
      description: "Acquire satellite protocols.",
      rewardPoolDrops: [
        { item: "Gyromag Systems", count: 5, chance: 28.57, rarity: "Common" },
        { item: "Atmo Systems", count: 5, chance: 14.29, rarity: "Uncommon" },
        { item: "Repeller Systems", count: 3, chance: 7.14, rarity: "Rare" }
      ]
    },
    {
      id: "profit_taker_phase_2",
      type: "Profit Taker: Phase 2",
      enemyLevels: [40, 60],
      standingStages: [1000],
      description: "Get Profit Takers harmonic schema.",
      rewardPoolDrops: [
        { item: "Gyromag Systems", count: 5, chance: 28.57, rarity: "Common" },
        { item: "Atmo Systems", count: 5, chance: 14.29, rarity: "Uncommon" },
        { item: "Repeller Systems", count: 3, chance: 7.14, rarity: "Rare" }
      ]
    },
    {
      id: "profit_taker_phase_3",
      type: "Profit Taker: Phase 3",
      enemyLevels: [40, 60],
      standingStages: [1000],
      description: "Steal gravimag.",
      rewardPoolDrops: [
        { item: "Gyromag Systems", count: 5, chance: 28.57, rarity: "Common" },
        { item: "Atmo Systems", count: 5, chance: 14.29, rarity: "Uncommon" },
        { item: "Repeller Systems", count: 3, chance: 7.14, rarity: "Rare" }
      ]
    },
    {
      id: "profit_taker_phase_4",
      type: "Profit Taker: Phase 4",
      enemyLevels: [50, 60],
      standingStages: [1000],
      description: "Destroy the Profit Taker.",
      rewardPoolDrops: [
        { item: "Crisma Toroid", count: 1, chance: 100.0, rarity: "Common" },
        { item: "Profit-Taker Articula", count: 1, chance: 5.0, rarity: "Rare" }
      ]
    },
    {
    id: "exploiter_deck_12",
    type: "Exploiter Orb Deck 12",
    enemyLevels: [40, 60],
    standingStages: [1000],
    description: "Destroy the Exploiter Orb at Deck 12.",
    rewardPoolDrops: [
      { item: "Lazulite Toroid", count: 1, chance: 100.0, rarity: "Common" },,
      { item: "Exploiter Articula", count: 1, chance: 5.0, rarity: "Rare" }
    ]
    }
  ];



export default function Vallis() {
  const [vallisCycle, setVallisCycle] = useState(null);
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
        setVallisCycle(data.vallisCycle);

        // 2. Extract Eudico's Bounties
        const allSyndicates = data.syndicateMissions || [];
        const solarisData = allSyndicates.find(
          (syn) => syn.syndicateKey === 'Solaris United'
        );
        
        // Ensure jobs exist before setting them
        if (solarisData && solarisData.jobs) {
          setBounties(solarisData.jobs);
        } else {
          setBounties([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Orb Vallis data...</div>;
  }

  const isCold = vallisCycle?.state === 'cold';

  return (
    <div className="w-full max-w-7xl space-y-6">
      
      {/* Dynamic Header / Cycle Banner */}
      <div className={`p-6 rounded-xl border relative overflow-hidden transition-colors duration-500 ${
        isCold 
          ? 'bg-cyan-900/20 border-cyan-500/30' 
          : 'bg-orange-900/20 border-orange-500/30'
      }`}>
        {/* Background glow effects based on time of day */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isCold ? 'bg-cyan-400' : 'bg-orange-500'
        }`}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Fortuna</h1>
            <p className="text-slate-400">Orb Vallis</p>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold uppercase tracking-wider mb-1 ${
              isCold ? 'text-cyan-400' : 'text-orange-500'
            }`}>
              {isCold ? 'Cold' : 'Warm'}
            </div>
            <div className="text-slate-300">
              Time remaining: <Countdown expiry={vallisCycle?.expiry} />
            </div>
          </div>
        </div>
      </div>

      {/* Bounty Board Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-200">Eudico's Bounties</h2>
          <span className="text-sm text-slate-200">Solaris United Syndicate</span>
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
                    <span className="text-cyan-300 text-sm">Reputation</span>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded">
                      <span className="font-bold text-amber-400 text-sm">
                        +{totalStanding.toLocaleString()}
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

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-yellow-400">Solaris United Heists</h2>
          </div>
          <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">
            Old Mate Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROFIT_TAKER_HEISTS.map((heist) => {
            const totalStanding = heist.standingStages 
              ? heist.standingStages.reduce((a, b) => a + b, 0) 
              : 0;

            return (
              <button
                key={heist.id}
                onClick={() => openBountyModal(heist)}
                className="bg-slate-900/80 border border-yellow-500/30 rounded-lg p-5 hover:border-yellow-400 hover:bg-yellow-950/20 transition-all text-left flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-yellow-300 transition-colors">
                      {heist.type}
                    </h3>
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded font-mono border border-yellow-500/40">
                      Lvl {heist.enemyLevels[0]}-{heist.enemyLevels[1]}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {heist.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Reputation</span>
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                    <span className="font-bold text-yellow-300 text-xs">
                      +{totalStanding.toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <BountyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        job={selectedBounty} 
      />
    </div>
  );
}