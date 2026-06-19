import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  // 1. ADD NEW STATE
  const [alerts, setAlerts] = useState([]);
  const [fissures, setFissures] = useState([]); // State to hold the fissures
  const [loading, setLoading] = useState(true);

  // 2. UPDATE THE DATABASE LISTENER
  useEffect(() => {
    const documentReference = doc(db, 'worldState', 'latest');

    const unsubscribe = onSnapshot(documentReference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Pull both arrays out of the database payload
        setAlerts(data.alerts || []); 
        setFissures(data.fissures || []); 
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. RENDER THE UI
  return (
    <div className="w-full max-w-6xl p-4 space-y-12">
      
      {/* --- ALERTS SECTION --- */}
      <section>
        <h2 className="text-2xl font-bold text-red-500 mb-6">Active Alerts</h2>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-slate-400">No active alerts at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                <h3 className="font-semibold text-white">{alert.mission.node}</h3>
                <p className="text-sm text-slate-300">{alert.mission.type} - {alert.mission.faction}</p>
                <p className="text-sm font-bold text-accent mt-2">
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
        ) : fissures.length === 0 ? (
          <p className="text-slate-400">No active fissures at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fissures.map((fissure) => (
              <div key={fissure.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{fissure.node}</h3>
                    {/* Badge for the Relic Tier (Lith, Meso, Neo, Axi, etc.) */}
                    <span className="text-xs font-bold px-2 py-1 bg-blue-900/50 text-blue-300 rounded border border-blue-800">
                      {fissure.tier}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{fissure.missionType} - {fissure.enemy}</p>
                </div>
                
                {/* Special Tags for Steel Path and Void Storms (Railjack) */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {fissure.isHard && (
                    <span className="text-xs font-bold px-2 py-1 bg-red-900/40 text-red-400 rounded">
                      Steel Path
                    </span>
                  )}
                  {fissure.isStorm && (
                    <span className="text-xs font-bold px-2 py-1 bg-purple-900/40 text-purple-400 rounded">
                      Void Storm
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}