import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wheat, TrendingUp, LineChart,
  MessageSquareText, LogOut, Leaf, CloudSun, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/upload-crop',   icon: Wheat,             label: 'Upload Crop' },
  { to: '/market-prices', icon: TrendingUp,        label: 'Market Prices' },
  { to: '/predictions',   icon: LineChart,         label: 'AI Predictions' },
  { to: '/ai-assistant',  icon: MessageSquareText, label: 'AI Assistant' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-indigo-100 bg-white shadow-[2px_0_12px_rgba(99,102,241,0.07)] transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo + toggle */}
      {collapsed ? (
        <div className="flex flex-col items-center border-b border-indigo-100 py-3 gap-2">
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(79,70,229,0.40)]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex items-center px-5 gap-3 border-b border-indigo-100 h-[73px]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(79,70,229,0.40)]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-indigo-950 text-lg leading-none">AgroLink</h1>
            <span className="text-xs font-mono text-indigo-400 tracking-wider">AI PLATFORM</span>
          </div>
          <button
            onClick={onToggle}
            className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Weather strip */}
      {!collapsed && (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 font-semibold">Accra, GH</span>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="mx-auto mt-4 w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center" title="Accra, GH">
          <CloudSun className="w-4 h-4 text-amber-500" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-body font-medium transition-all duration-150 group ${
                collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-[0_2px_10px_rgba(79,70,229,0.35)]'
                  : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-indigo-300 group-hover:text-indigo-500'}`} />
                {!collapsed && label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className={`border-t border-indigo-100 ${collapsed ? 'p-2' : 'p-4'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center" title={user?.full_name || 'Farmer'}>
              <span className="text-xs font-display font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() || 'F'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-display font-bold text-white">
                  {user?.full_name?.charAt(0).toUpperCase() || 'F'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-display font-semibold text-indigo-950 truncate">{user?.full_name || 'Farmer'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.region || 'Ghana'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
