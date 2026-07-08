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
  const [duviriCycle, setduviriCycle] = useState(null);
  const [warframes, setWarframes] = useState(null);
  const [incarnons, setIncarnons] = useState(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const docRef = doc(db, 'worldState', 'latest');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 1. Store the raw data in a local, immediate variable first
        const currentCycleData = data.duviriCycle; 
        
        // 2. Set the React state for your banner
        setduviriCycle(currentCycleData); 
        
        // 3. Evaluate the LOCAL variable (currentCycleData), NOT the React state variable
        if (currentCycleData && Array.isArray(currentCycleData.choices)) {
          // Normal Circuit choices (Index 0)
          const normalCategory = currentCycleData.choices[0];
          if (normalCategory && normalCategory.choices) {
            setWarframes(normalCategory.choices);
          }

          // Steel Path Circuit choices (Index 1)   
          const hardCategory = currentCycleData.choices[1];
          if (hardCategory && hardCategory.choices) {
            setIncarnons(hardCategory.choices);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  

 const getSpiralConfig = (state) => {
    const mood = state?.toLowerCase() || '';
    
    switch (mood) {
      case 'joy':
        return {
          bannerClass: 'bg-pink-950/20 border-pink-500/30',
          glowClass: 'bg-pink-500',
          textClass: 'text-pink-400',
          label: ':D Joy'
        };
      case 'anger':
        return {
          bannerClass: 'bg-red-950/20 border-red-500/30',
          glowClass: 'bg-red-500',
          textClass: 'text-red-400',
          label: '>:O Anger'
        };
      case 'envy':
        return {
          bannerClass: 'bg-emerald-950/20 border-emerald-600/30', // Murky Green
          glowClass: 'bg-emerald-600',
          textClass: 'text-emerald-400',
          label: '>:/ Envy'
        };
      case 'sorrow':
        return {
          bannerClass: 'bg-slate-900/40 border-slate-500/30',     // Grey
          glowClass: 'bg-slate-500',
          textClass: 'text-slate-400',
          label: ' :( Sorrow'
        };
      case 'fear':
        return {
          bannerClass: 'bg-yellow-950/20 border-yellow-500/30',
          glowClass: 'bg-yellow-500',
          textClass: 'text-yellow-400',
          label: ':O Fear'
        };
      default:
        return {
          bannerClass: 'bg-slate-900/20 border-slate-800',
          glowClass: 'bg-slate-600',
          textClass: 'text-slate-400',
          label: '🌀 Unknown Spiral'
        };
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Duviri data...</div>;
  }

  const currentSpiral = getSpiralConfig(duviriCycle?.state);

  return (
    <div className="w-full max-w-7xl space-y-6">
      
      {/* Dynamic Header / Cycle Banner using Resolved Switch Properties */}
      <div className={`p-6 rounded-xl border relative overflow-hidden transition-colors duration-500 ${currentSpiral.bannerClass}`}>
        
        {/* Background glow effects configured by active mood */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${currentSpiral.glowClass}`}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Duviri</h1>
            <p className="text-slate-400">The Paradox</p>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold uppercase tracking-wider mb-1 ${currentSpiral.textClass}`}>
              {currentSpiral.label}
            </div>
            <div className="text-slate-300">
              Time remaining: <Countdown expiry={duviriCycle?.expiry} />
            </div>
          </div>
        </div>
      </div>



    {/* Weekly Circuit Selections Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-200 border-b border-slate-800 pb-2">
          Weekly Circuit Offerings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Normal Circuit (Warframes) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
              🛡️ Normal Circuit <span className="text-xs text-slate-500 font-normal">(Warframe Blueprints)</span>
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {
              warframes && warframes.length > 0 ? (
                warframes.map((frame, index) => (
                  <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-medium shadow-sm">
                    {frame}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-sm">No Warframe selection data found.</p>
              )}
            </div>
          </div>

          {/* Steel Path Circuit (Incarnon Adapters) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              ⚔️ Steel Path Circuit <span className="text-xs text-slate-500 font-normal">(Incarnon Evolutions)</span>
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {incarnons && incarnons.length > 0 ? (
                incarnons.map((weapon, index) => (
                  <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-medium shadow-sm">
                    {weapon}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-sm">No Incarnon selection data found.</p>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
   );

}