import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation(); // Tells us which URL we are currently on

  const navItems = [
    { name: 'Alerts & Fissures', path: '/', icon: '⚠️' },
    { name: 'World Overview', path: '/world', icon: '🌍' },
    { name: "Baro Ki'Teer", path: '/baro', icon: '💎' },
    {name: 'Cetus', path: '/cetus', icon: '🌾'},
    {name: 'Vallis', path: '/vallis', icon: '❄️'},
    {name: 'Deimos', path: '/cambion', icon: '🦠'},
    {name: 'Duviri', path: '/duviri', icon: '🌀'},
    {name: 'Hollvania', path: '/hollvania', icon: '🏰'},
    {name: 'Zariman', path: '/zariman', icon: '🛸'},
  ];

  return (
    <div className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Sidebar Header & Toggle */}
      <div className="p-4 flex justify-between items-center border-b border-slate-800">
        {!isCollapsed && <span className="font-bold text-red-500 text-lg whitespace-nowrap">Menu</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 mx-auto"
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded transition-colors ${isActive ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-semibold whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button at the bottom */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded hover:bg-slate-800 transition-colors"
        >
          <span>🚪</span>
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
      
    </div>
  );
}