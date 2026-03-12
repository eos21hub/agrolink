import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LayoutDashboard, Wheat, TrendingUp, LineChart, MessageSquareText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/upload-crop',   icon: Wheat,             label: 'Upload Crop' },
  { to: '/market-prices', icon: TrendingUp,        label: 'Market Prices' },
  { to: '/predictions',   icon: LineChart,         label: 'AI Predictions' },
  { to: '/ai-assistant',  icon: MessageSquareText, label: 'AI Assistant' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="lg:hidden sticky top-0 z-50 border-b border-blue-100 bg-white shadow-[0_2px_8px_rgba(59,130,246,0.07)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-blue-900">AgroLink AI</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg text-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-blue-100 bg-white px-3 py-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-700 hover:bg-blue-50 hover:text-blue-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-blue-100">
            <div className="px-3 py-1.5 text-xs text-blue-400 font-medium">{user?.full_name} · {user?.region}</div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
