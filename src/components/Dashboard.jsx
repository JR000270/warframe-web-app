import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// --- NEW COUNTDOWN COMPONENT ---
const Countdown = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(expiry).getTime() - Date.now();
      
      if (difference <= 0) {
        return "Expired";
      }
      
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
      if (newTime === "Expired") clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  return (
    <span className={`font-mono text-xs font-semibold ${timeLeft === 'Expired' ? 'text-red-500' : 'text-slate-400'}`}>
      {timeLeft === 'Expired' ? 'Expired' : `⏱ ${timeLeft}`}
    </span>
  );
};

export default function Dashboard() {
  // 1. DATA STATE
  const [alerts, setAlerts] = useState([]);
  const [fissures, setFissures] = useState([]);
  const [arbitration, setArbitration] = useState(null);
  const [voidTrader, setVoidTrader] = useState(null); // <-- Added Baro State
  const [loading, setLoading] = useState(true);

  // 2. UI TOGGLE STATE
  const [showNormal, setShowNormal] = useState(true);
  const [showSteelPath, setShowSteelPath] = useState(false);
  const [showRailjack, setShowRailjack] = useState(false);

  useEffect(() => {
    const documentReference = doc(db, 'worldState', 'latest');

    const unsubscribe = onSnapshot(documentReference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAlerts(data.alerts || []); 
        setFissures(data.fissures || []); 
        setArbitration(data.arbitration || null);
        setVoidTrader(data.voidTrader || null); // <-- Syncing Baro Data
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasArbitration = 
    arbitration && 
    Object.keys(arbitration).length > 0 && 
    !arbitration.expired &&
    arbitration.node !== "SolNode000";

  // Calculate if Baro is active based on his activation timestamp
  const isBaroActive = voidTrader && new Date(voidTrader.activation).getTime() <= Date.now();
  
  // --- SORTING LOGIC ---
  const tierWeights = {
    'Lith': 1, 'Meso': 2, 'Neo': 3, 'Axi': 4, 'Omnia': 5, 'Requiem': 6
  };

  const sortFissuresByTier = (a, b) => {
    const weightA = tierWeights[a.tier] || 99; 
    const weightB = tierWeights[b.tier] || 99;
    return weightA - weightB;
  };

  const normalFissures = fissures.filter(f => !f.isHard && !f.isStorm).sort(sortFissuresByTier);
  const steelPathFissures = fissures.filter(f => f.isHard).sort(sortFissuresByTier);
  const railjackFissures = fissures.filter(f => f.isStorm).sort(sortFissuresByTier);


  // --- STYLING LOGIC ---
  const getTierBadge = (tier) => {
    let styles = "";
    switch(tier) {
      case 'Lith': 
        styles = "bg-[#F5F5DC]/10 text-[#F5F5DC] border-[#F5F5DC]/50"; 
        break;
      case 'Meso': 
        styles = "bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/50"; 
        break;
      case 'Neo': 
        styles = "bg-[#C0C0C0]/10 text-[#C0C0C0] border-[#C0C0C0]/50"; 
        break;
      case 'Axi': 
        styles = "bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/50"; 
        break;
      case 'Omnia': 
        styles = "bg-gradient-to-r from-[#F5F5DC] via-[#C0C0C0] to-[#FFD700] text-slate-900 border-none font-bold shadow-[0_0_8px_rgba(255,215,0,0.4)]"; 
        break;
      case 'Requiem': 
        styles = "bg-[#8B0000]/20 text-[#FF6347] border-[#8B0000]"; 
        break;
      default: 
        styles = "bg-slate-700 text-slate-300 border-slate-600";
    }
    return (
      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border tracking-wider ${styles}`}>
        {tier}
      </span>
    );
  };


  // --- UI RENDER HELPER ---
  const renderFissureCards = (fissureList) => {
    if (fissureList.length === 0) {
      return <p className="text-slate-400 py-4 text-center">No active fissures.</p>;
    }

    return (
      <div className="flex flex-col gap-3">
        {fissureList.map((fissure) => (
          <div key={fissure.id} className="bg-slate-800 p-3 rounded border border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1 gap-2">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-white leading-tight">{fissure.node}</h3>
                  <Countdown expiry={fissure.expiry} />
                </div>
                {getTierBadge(fissure.tier)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{fissure.missionType} - {fissure.enemy}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl p-4 space-y-12">
      
      {/* --- ALERTS SECTION --- */}
      <section>
        <h2 className="text-2xl font-bold text-red-500 mb-6">Active Alerts</h2>

        {/* --- BARO KI'TEER INTERACTIVE BANNER LOCATION --- */}
        {voidTrader && (
          isBaroActive ? (
            <Link 
              to="/baro" 
              className="block mb-6 p-5 rounded-lg border bg-teal-900/20 border-teal-700/40 hover:border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_20px_rgba(20,184,166,0.25)] transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-teal-400 text-xl flex items-center gap-2 mb-1 group-hover:text-teal-300">
                    💎 Baro Ki'Teer Arrived!
                  </h3>
                  <p className="text-slate-300">
                    Currently at <span className="font-bold text-white group-hover:underline">{voidTrader.location}</span>. Click to view current inventory ledger.
                  </p>
                </div>
                
                <div className="text-left md:text-right bg-slate-900/60 p-3 rounded border border-slate-700/50 w-full md:w-auto">
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">
                    Departs in:
                  </p>
                  <div className="text-lg font-bold text-white">
                    <Countdown expiry={voidTrader.expiry} />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="mb-6 p-5 rounded-lg border bg-slate-800 border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-400 text-xl flex items-center gap-2 mb-1">
                  🌌 Baro Ki'Teer
                </h3>
                <p className="text-slate-400">Traveling through the Void...</p>
              </div>
              <div className="text-left md:text-right bg-slate-900/50 p-3 rounded border border-slate-700/50 w-full md:w-auto">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Arrives in:</p>
                <div className="text-lg text-white">
                  <Countdown expiry={voidTrader.activation} />
                </div>
              </div>
            </div>
          )
        )}

        {/* --- CARDS LAYOUT DOWN BELOW --- */}
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : alerts.length === 0 && !hasArbitration ? (
          <p className="text-slate-400">No active alerts at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. ARBITRATION CARD */}
            {hasArbitration && (
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-400 shadow-[0_0_8px_rgba(203,213,225,0.15)]">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-white leading-tight">{arbitration.node}</h3>
                    <Countdown expiry={arbitration.expiry} />
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border tracking-wider bg-slate-300/20 text-slate-300 border-slate-400/50">
                    Arbitration
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{arbitration.type} - {arbitration.enemy}</p>
                <p className="text-sm font-bold text-slate-300 mt-2">
                  Reward: Vitus Essence
                </p>
              </div>
            )}

            {/* 2. STANDARD ALERTS */}
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-white leading-tight">{alert.mission.node}</h3>
                      <Countdown expiry={alert.expiry} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{alert.mission.type} - {alert.mission.faction}</p>
                </div>
                <p className="text-sm font-bold text-accent mt-3">
                  Reward: {alert.mission.reward.asString}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- FISSURES SECTION --- */}
      <section>
        <h2 className="text-2xl font-bold text-blue-400 mb-6">Active Fissures</h2>
        
        {loading ? (
          <p className="text-slate-400">Loading...</p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            
            {/* NORMAL COLUMN */}
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
              <button 
                onClick={() => setShowNormal(!showNormal)}
                className="w-full bg-slate-800 hover:bg-slate-750 p-4 flex justify-between items-center transition-colors text-left"
              >
                <span className="font-bold text-blue-300">
                  Normal ({normalFissures.length})
                </span>
                <span className="text-slate-400 text-xs">{showNormal ? '▼' : '▶'}</span>
              </button>
              {showNormal && (
                <div className="p-3 border-t border-slate-700">
                  {renderFissureCards(normalFissures)}
                </div>
              )}
            </div>

            {/* STEEL PATH COLUMN */}
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
              <button 
                onClick={() => setShowSteelPath(!showSteelPath)}
                className="w-full bg-slate-800 hover:bg-slate-750 p-4 flex justify-between items-center transition-colors text-left"
              >
                <span className="font-bold text-red-400">
                  Steel Path ({steelPathFissures.length})
                </span>
                <span className="text-slate-400 text-xs">{showSteelPath ? '▼' : '▶'}</span>
              </button>
              {showSteelPath && (
                <div className="p-3 border-t border-slate-700">
                  {renderFissureCards(steelPathFissures)}
                </div>
              )}
            </div>

            {/* RAILJACK COLUMN */}
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
              <button 
                onClick={() => setShowRailjack(!showRailjack)}
                className="w-full bg-slate-800 hover:bg-slate-750 p-4 flex justify-between items-center transition-colors text-left"
              >
                <span className="font-bold text-purple-400">
                  Railjack ({railjackFissures.length})
                </span>
                <span className="text-slate-400 text-xs">{showRailjack ? '▼' : '▶'}</span>
              </button>
              {showRailjack && (
                <div className="p-3 border-t border-slate-700">
                  {renderFissureCards(railjackFissures)}
                </div>
              )}
            </div>

          </div>
        )}
      </section>

    </div>
  );
}