import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// 1. We bring in the live Countdown component!
const Countdown = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiry) return;
    
    const calculateTime = () => {
      const difference = new Date(expiry).getTime() - Date.now();
      
      if (difference <= 0) return "Expired";
      
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

  return <span className="font-mono">{timeLeft}</span>;
};


export default function World() {
  //setting variables for the different world states
  const [cycles, setCycles] = useState(null);
  const [sortie, setSortie] = useState(null);
  const [archonHunt, setArchonHunt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [construction, setConstruction] = useState(null);
  const [invasions, setInvasions] = useState([]);
  const [darvoDeal, setDarvoDeal] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'worldState', 'latest');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        setCycles({
          cetus: data.cetusCycle || data.cetus,
          vallis: data.vallisCycle || data.vallis,
          cambion: data.cambionCycle || data.cambion,
          duviri: data.duviriCycle || data.duviri
        });
        setSortie(data.sortie || null);
        setArchonHunt(data.archonHunt || null);
        setConstruction(data.constructionProgress || null);
        setInvasions(data.invasions || []);
        setDarvoDeal(data.darvoDeal || null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const CycleCard = ({ name, data }) => {
    // 3. Fallback UI: If a cycle is missing (like Vallis), show this instead of vanishing
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex flex-col items-center justify-center text-slate-500 min-h-[140px]">
          <p className="font-semibold">{name} Data Unavailable</p>
        </div>
      );
    }

    let displayState = "";
    let displayColor = "";

    switch (name) {
      case "Cetus":
        displayState = data.state === 'day' ? 'Day' : 'Night';
        displayColor = "text-yellow-400";
        break;
      case "Orb Vallis":
        displayState = data.state === 'warm' ? 'Warm' : 'Cold';
        displayColor = "text-blue-300";
        break;
      case "Cambion Drift":
        displayState = data.state === 'vome' ? 'Vome' : 'Fass';
        displayColor = "text-purple-400";
        break;
      case "Duviri":
        displayState = `${data.state ? data.state.charAt(0).toUpperCase() + data.state.slice(1) : 'Unknown'}`;
        displayColor = "text-orange-400";
        break;
      default:
        displayState = data.state;
        displayColor = "text-white";
    }

    return (
      <div className="bg-cyan-900/40 p-6 rounded-lg border border-cyan-500/60 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] hover:bg-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] flex flex-col justify-between min-h-[140px]">
        <div>
          <h3 className={`text-xl font-bold mb-2 ${displayColor}`}>{name}</h3>
          <p className="text-lg font-semibold text-white">{displayState}</p>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          {/* Using the new live ticking countdown */}
          Ends in: <Countdown expiry={data.expiry} />
        </p>
      </div>
    );
  };

  if (loading) return <div className="text-white p-8">Loading world cycles...</div>;
  if (!cycles) return <div className="text-white p-8">No cycle data found.</div>;

  return (
    <div className="w-full max-w-7xl p-4 px-4 space-y-8">
        {/* Open World Cycles */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Open World Cycles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/cetus" className="hover:scale-103 transition-transform">
           <CycleCard name="Cetus" data={cycles.cetus}/>
          </Link>
          <Link to="/vallis" className="hover:scale-103 transition-transform">
            <CycleCard name="Orb Vallis" data={cycles.vallis} />
          </Link>
          <Link to="/cambion" className="hover:scale-103 transition-transform">
            <CycleCard name="Cambion Drift" data={cycles.cambion} />
          </Link>
          <Link to="/duviri" className="hover:scale-103 transition-transform">
            <CycleCard name="Duviri" data={cycles.duviri} />
          </Link>
        </div>
      </section>

    {/* Darvo Deal */}
    <section>
      <h2 className="text-2xl font-bold text-white mb-3">Darvo Deal</h2>
      <div className="bg-cyan-900/40 p-1 rounded-sm border border-cyan-500/60 shadow-sm flex flex-col items-left justify-center text-white min-h-[70px]">
        {darvoDeal ? (
          <p>Hey Tenno, check this merch out! {darvoDeal[0].item} for {darvoDeal[0].salePrice} platinum, ({darvoDeal[0].discount}% off!)</p>): 
          (
          <p className="text-slate-500 italic">No Darvo deal available.</p>
        )}
      </div>
    </section>

    {/* Sortie and Archon Hunt */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Sortie and Archon Hunt</h2>
        </div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* COLUMN 1: Sortie */}
        <div className="bg-cyan-500/40 border border-cyan-500/60 rounded-lg overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="bg-cyan-800 p-4 border-b border-cyan-500/60 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                Sortie
              </h2>
              {sortie && (
                <p className="text-sm text-slate-300 mt-1">
                  Vs. {sortie.faction} • <span className="font-semibold text-white">{sortie.boss}</span>
                </p>
              )}
            </div>
            {sortie && (
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 font-bold">Resets In</p>
                <Countdown expiry={sortie.expiry} />
              </div>
            )}
          </div>
          
          {/* Mission List */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            {!sortie ? (
              <p className="text-slate-500 italic text-center py-4">Sortie data unavailable.</p>
            ) : (
              sortie.variants.map((mission, index) => (
                <div key={index} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">Mission {index + 1}</span>
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">{mission.modifier}</span>
                  </div>
                  <p className="text-sm text-yellow-500/80 font-semibold">{mission.missionType}</p>
                  <p className="text-xs text-slate-400">{mission.node}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: Archon Hunt */}
        <div className="bg-cyan-500/40 border border-cyan-500/60 rounded-lg overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="bg-cyan-800 p-4 border-b border-cyan-500/60 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                Archon Hunt
              </h2>
              {archonHunt && (
                <p className="text-sm text-slate-300 mt-1">
                  Vs. {archonHunt.faction} • <span className="font-semibold text-white">{archonHunt.boss}</span>
                </p>
              )}
            </div>
            {archonHunt && (
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 font-bold">Resets In</p>
                <Countdown expiry={archonHunt.expiry} />
              </div>
            )}
          </div>
          
          {/* Mission List */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            {!archonHunt ? (
              <p className="text-slate-500 italic text-center py-4">Archon Hunt data unavailable.</p>
            ) : (
              archonHunt.missions.map((mission, index) => (
                <div key={index} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">Stage {index + 1}</span>
                  </div>
                  <p className="text-sm text-red-400 font-semibold">{mission.type}</p>
                  <p className="text-xs text-slate-400">{mission.node}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* Invasion project construction */}
      <section className="bg-cyan-900/40 border border-cyan-500/60 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Faction Relay Attack Progress
        </h2>

        {!construction ? (
          <p className="text-slate-500 italic text-center py-4">Info unavailable.</p>
        ) : (
          <div className="flex flex-col gap-2">
            
            {/* Top Labels & Percentages */}
            <div className="flex justify-between items-end px-1">
              <div className="text-left flex items-baseline gap-2">
                <span className="block font-bold text-green-500 tracking-wide uppercase text-sm">Grineer Fomorian</span>
                <span className="text-lg font-mono font-bold text-green-400">{Number(construction.fomorianProgress).toFixed(2)}%</span>
              </div>
              <div className="text-right flex items-baseline gap-2 flex-row-reverse">
                <span className="block font-bold text-blue-300 tracking-wide uppercase text-sm">Corpus Razorback Armada</span>
                <span className="text-lg font-mono font-bold text-blue-300">{Number(construction.razorbackProgress).toFixed(2)}%</span>
              </div>
            </div>

            {/* The Dual Progress Bar */}
            <div className="flex w-full h-8 bg-slate-950 rounded border border-slate-800 overflow-hidden shadow-inner">
              
              {/* Grineer Left Half (Fills Left to Right) */}
              <div className="w-1/2 h-full bg-green-900/40 relative border-r border-slate-800/60">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)] transition-all duration-1000"
                  style={{ width: `${construction.fomorianProgress}%` }}
                ></div>
              </div>
              
              {/* Corpus Right Half (Fills Right to Left) */}
              <div className="w-1/2 h-full bg-blue-900/20 relative border-l border-slate-800/50">
                <div 
                  className="absolute top-0 right-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-1000"
                  style={{ width: `${construction.razorbackProgress}%` }}
                ></div>
              </div>
              
            </div>
          </div>
        )}
      </section>

        {/* Invasion Battles */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 mt-8 flex items-center gap-2">
          Active Invasions
        </h2>

        {invasions.length === 0 ? (
          <p className="text-slate-400">No active invasions</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invasions.map((inv, index) => {
              // Calculate the Attacker's visual width (since completion represents the Defender)
              const attackerWidth = 100 - inv.completion;

              // Helper function to dig out the reward safely
              const getRewardText = (factionData) => {
                const firstItem = factionData?.reward?.countedItems?.[0];
                if (firstItem) {
                  return firstItem.count > 1 ? `${firstItem.count}x ${firstItem.type}` : firstItem.type;
                }
                return null;
              };

              // Extract the clean strings before rendering the JSX
              const attackerReward = getRewardText(inv.attacker);
              const defenderReward = getRewardText(inv.defender);

              // Determine faction colors based on the invasion description
              const descLower = inv.desc.toLowerCase();
              let attackerBarColor = 'bg-red-600/80'; // Default attacker (Infested)
              let defenderBgColor = 'bg-blue-900/40'; // Default background
              
              let attackerTextColor = 'text-red-400';
              let defenderTextColor = 'text-blue-400';

              if (descLower.includes('grineer')) {
                attackerBarColor = 'bg-green-600/80';
                defenderBgColor = 'bg-blue-900/40';
                attackerTextColor = 'text-green-400';
                defenderTextColor = 'text-blue-400';
              } else if (descLower.includes('corpus')) {
                attackerBarColor = 'bg-blue-600/80';
                defenderBgColor = 'bg-green-900/40';
                attackerTextColor = 'text-blue-400';
                defenderTextColor = 'text-green-400';
              }

              return (
                <div key={index} className="bg-cyan-900/40 border border-cyan-500/60 rounded-lg p-4 shadow-sm flex flex-col justify-between h-full">
                  
                  {/* Top: Node & Description */}
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-lg leading-tight">{inv.node}</h3>
                    <p className="text-sm text-slate-400">{inv.desc}</p>
                  </div>

                  {/* Middle: Rewards */}
                  <div className="flex justify-between items-end mb-3 text-xs font-semibold">
                    {/* Attacker Reward (Left Side) */}
                    <div className="text-left w-1/2 pr-2">
                      {attackerReward ? (
                        <span className={`${attackerTextColor} block truncate`} title={attackerReward}>
                          {attackerReward}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic"></span>
                      )}
                    </div>

                    {/* Defender Reward (Right Side) */}
                    <div className="text-right w-1/2 pl-2 border-l border-slate-800">
                      {defenderReward ? (
                        <span className={`${defenderTextColor} block truncate`} title={defenderReward}>
                          {defenderReward}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">No Reward</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: The Tug-of-War Progress Bar */}
                  <div className={`w-full h-3 rounded overflow-hidden relative border border-slate-800 ${defenderBgColor}`}>
                    
                    {/* Attacker's fill bar with dynamic color */}
                    <div 
                      className={`h-full transition-all duration-1000 ${attackerBarColor}`}
                      style={{ width: `${attackerWidth}%` }}
                    ></div>
                  </div>
                  
                  {/* Percentage Readout */}
                  <div className="flex justify-between mt-1 text-[10px] text-white font-mono">
                    <span>{attackerWidth.toFixed(1) > 100 ? '100.0' : attackerWidth.toFixed(1)}%</span>
                    <span>{inv.completion.toFixed(1) < 0 ? '0.0' : inv.completion.toFixed(1)}%</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}