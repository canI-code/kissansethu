import { NavLink, useLocation } from 'react-router-dom';
import { Home, Tractor, Users, FileText, User } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function Navbar() {
  const { t } = useLang();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('होम', 'Home') },
    { path: '/equipment', icon: Tractor, label: t('उपकरण', 'Equipment') },
    { path: '/workers', icon: Users, label: t('मजदूर', 'Workers') },
    { path: '/schemes', icon: FileText, label: t('योजनाएं', 'Schemes') },
    { path: '/profile', icon: User, label: t('प्रोफ़ाइल', 'Profile') },
  ];

  return (
    <nav className="navbar">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
