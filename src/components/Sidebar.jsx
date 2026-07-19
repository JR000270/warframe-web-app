import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import sidebarBg from '../images/warframe_sidebar_background.png';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation(); // Tells us which URL we are currently on
  const navItems = [
    {name: 'World Overview', path: '/'},
    {name: 'Alerts & Fissures', path: '/dashboard'},
    {name: "Baro Ki'Teer", path: '/baro'},
    {name: 'Duviri', path: '/duviri'},
    {name: 'Cetus', path: '/cetus'},
    {name: 'Fortuna', path: '/vallis'},
    {name: 'Deimos', path: '/cambion'},
  ];

  return (
    <div 
      className={`flex flex-col border-r border-slate-800 transition-all duration-300 bg-cover bg-no-repeat bg-top w-64`}
      style={{ backgroundImage: `url(${sidebarBg})` }}
    >
    
      {/* Sidebar Header & Toggle */}
      <div className="px-2 pt-5 flex justify-between items-center ">
        <span className="px-2 pt-1 font-bold h-12 w-22.5 text-cyan-500 text-2xl whitespace-nowrap border rounded-sm border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)]">
         Menu</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 pt-9 space-y-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-1 p-3 w-[170px] rounded-sm transition-all hover:scale-103 duration-300 backdrop-blur-[2px]
                ${isActive 
                  ? /* active: Red Hologram */
                    'text-red-400 border border-red-500/80 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.5),inset_0_0_10px_rgba(239,68,68,0.3)] hover:bg-red-900/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]' 
                  : /* inactive: Cyan Hologram */
                    'text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] hover:bg-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
             <span className="font-semibold whitespace-nowrap tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      {/* Logout Button at the bottom
      <div className="p-4 ">
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm 'text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] 
          hover:text-red-400 hover:bg-red-950/30 hover:border-red-500/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'"
        >
          <span>Log Out</span>
        </button>
      </div> */}
      <div className="p-4 ">
        <button 
          onClick={() => window.location.href = '/support'}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm 'text-cyan-400 border border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.3),inset_0_0_6px_rgba(34,211,238,0.15)] 
          hover: hover:bg-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'"
        >
          <span>Support</span>
        </button>
        </div>
      
    </div>
  );
}