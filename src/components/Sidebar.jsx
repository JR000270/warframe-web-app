import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import sidebarBg from '../images/warframe_sidebar_background.png';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation(); // Tells us which URL we are currently on
  const navItems = [
    { name: 'Alerts & Fissures', path: '/'},
    { name: 'World Overview', path: '/world'},
    { name: "Baro Ki'Teer", path: '/baro'},
    {name: 'Cetus', path: '/cetus'},
    {name: 'Fortuna', path: '/vallis'},
    {name: 'Deimos', path: '/cambion'},
    {name: 'Duviri', path: '/duviri'},
  ];

  return (
    <div 
      className={`flex flex-col border-r border-slate-800 transition-all duration-300 bg-cover bg-no-repeat bg-top ${isCollapsed ? 'w-20' : 'w-64'}`} 
      style={{ backgroundImage: `url(${sidebarBg})` }}
    >
    
      {/* Sidebar Header & Toggle */}
      <div className="px-2 pt-7 flex justify-between items-center ">
        {!isCollapsed && <span className="font-bold h-9 w-[60px] text-cyan-500 text-lg whitespace-nowrap border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)]">
         Menu</span>}
        {/* <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-left justify-center pt-1 h-10 w-20 text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)]"
        >
          {isCollapsed ? '>' : '<'}
        </button> */}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 pt-9 space-y-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-1 p-3 w-[170px] rounded-sm transition-all duration-300 backdrop-blur-[2px]
                ${isActive 
                  ? /* ACTIVE STATE: Red Hologram */
                    'text-red-400 border border-red-500/80 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.5),inset_0_0_10px_rgba(239,68,68,0.3)]' 
                  : /* INACTIVE STATE: Cyan Hologram */
                    'text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] hover:bg-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-semibold whitespace-nowrap tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      {/* Logout Button at the bottom */}
      <div className="p-4 ">
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm 'text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] 
          hover:text-red-400 hover:bg-red-950/30 hover:border-red-500/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'"
        >
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
      
    </div>
  );
}