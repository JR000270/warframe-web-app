import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; //imports the connection made earlier

export default function Dashboard() {
  //create an 'alerts' variable holding an empty array [], and a 'setAlerts' function to update it.
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // This block runs exactly once when the component first appears on screen.
  useEffect(() => {
    // We point Firebase exactly to the document your Azure function updates
    const documentReference = doc(db, 'worldState', 'latest');

    //listener
    // onSnapshot opens the live connection. Every time the document changes, it runs the arrow function.
    const unsubscribe = onSnapshot(documentReference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAlerts(data.alerts || []); // Update our State with the new alerts!
      } else {
        console.log("No data found in database.");
      }
      setLoading(false);
    });

    // When the user navigates away from this page, we clean up and close the live connection to save memory.
    return () => unsubscribe();
  }, []); // The empty array [] means "only run this setup once"


  //render
  //using standard JavaScript `.map()` to loop through the alerts array and draw a box for each one.
  return (
    <div className="w-full max-w-4xl p-4">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Active Alerts</h2>
      
      {loading ? (
        <p className="text-slate-400">Connecting to navigation relay...</p>
      ) : alerts.length === 0 ? (
        <p className="text-slate-400">No active alerts at the moment.</p>
      ) : (
        <div className="grid gap-4">
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
    </div>
  );
}