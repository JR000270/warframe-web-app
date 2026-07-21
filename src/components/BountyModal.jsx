export default function BountyModal({ isOpen, onClose, job }) {
  // If the modal isn't open, or there is no job data, render nothing
  // note for future me: modals are like pop up menus that overlay the current page
  if (!isOpen || !job) return null;

  // Rarity color mapping for a cool UI touch
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-amber-700'; // Bronze-ish
      case 'uncommon': return 'text-slate-300'; // Silver
      case 'rare': return 'text-yellow-400'; // Gold
      default: return 'text-teal-400';
    }
  };

  return (
    // backdrop: Fixed to cover the screen, clicking this triggers onClose()
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-none p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* modal box: Clicking inside here stops the click from reaching the backdrop */}
      <div 
        className="relative w-full max-w-lg bg-cyan-900/90 border border-cyan-500/50 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header Section */}
        <div className="bg-cyan-950/35 border-b border-cyan-500/30 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wider">
              Bounty Rewards
            </h2>
            <p className="text-cyan-400 text-sm">
              Level {job.enemyLevels[0]} - {job.enemyLevels[1]}
            </p>
          </div>
          
          {/* Close 'X' Button */}
          <button 
            onClick={onClose}
            className="text-cyan-500 hover:text-white hover:bg-cyan-500/20 p-2 rounded-lg transition-colors font-bold text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Loot List */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {job.rewardPoolDrops && job.rewardPoolDrops.length > 0 ? (
            <ul className="space-y-2">
              {job.rewardPoolDrops.map((drop, index) => (
                <li 
                  key={index} 
                  className="flex justify-between items-center bg-slate-800/50 border border-slate-700 p-3 rounded-lg hover:bg-slate-800 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">
                      {drop.item} <span className="text-slate-400 text-sm font-normal">x{drop.count}</span>
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${getRarityColor(drop.rarity)}`}>
                      {drop.rarity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-300 font-bold bg-cyan-950/50 px-3 py-1 rounded border border-cyan-500/20">
                      {drop.chance}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-slate-500 py-8 italic">
              No reward data available for this bounty.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}