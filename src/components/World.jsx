import { useState, useEffect } from 'react';
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
  const [cycles, setCycles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'worldState', 'latest');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // 2. FIX: We now look for the exact 'Cycle' keys from your database
        setCycles({
          cetus: data.cetusCycle || data.cetus,
          vallis: data.vallisCycle || data.vallis,
          cambion: data.cambionCycle || data.cambion,
          duviri: data.duviriCycle || data.duviri
        });
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
          <span className="text-2xl mb-2">📡</span>
          <p className="font-semibold">{name} Data Unavailable</p>
        </div>
      );
    }

    let displayState = "";
    let displayColor = "";

    switch (name) {
      case "Cetus":
        displayState = data.state === 'day' ? '☀️ Day' : '🌙 Night';
        displayColor = "text-yellow-400";
        break;
      case "Orb Vallis":
        displayState = data.state === 'warm' ? '🔥 Warm' : '❄️ Cold';
        displayColor = "text-blue-300";
        break;
      case "Cambion Drift":
        displayState = data.state === 'vome' ? '🟣 Vome' : '🟠 Fass';
        displayColor = "text-purple-400";
        break;
      case "Duviri":
        displayState = `🎭 ${data.state ? data.state.charAt(0).toUpperCase() + data.state.slice(1) : 'Unknown'}`;
        displayColor = "text-orange-400";
        break;
      default:
        displayState = data.state;
        displayColor = "text-white";
    }

    return (
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-between min-h-[140px]">
        <div>
          <h3 className={`text-xl font-bold mb-2 ${displayColor}`}>{name}</h3>
          <p className="text-lg font-semibold text-white">{displayState}</p>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          {/* Use the new live ticking countdown! */}
          Ends in: <Countdown expiry={data.expiry} />
        </p>
      </div>
    );
  };

  if (loading) return <div className="text-white p-8">Loading world cycles...</div>;
  if (!cycles) return <div className="text-white p-8">No cycle data found.</div>;

  return (
    <div className="w-full max-w-7xl p-4 space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-green-400 mb-6">Open World Cycles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CycleCard name="Cetus" data={cycles.cetus} />
          <CycleCard name="Orb Vallis" data={cycles.vallis} />
          <CycleCard name="Cambion Drift" data={cycles.cambion} />
          <CycleCard name="Duviri" data={cycles.duviri} />
        </div>
      </section>
    </div>
  );
}