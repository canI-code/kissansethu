import { NavLink, useLocation } from 'react-router-dom';
import { Home, Tractor, Users, FileText, User, MessageCircle, Phone } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { t } = useLang();
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Don't show navbar on landing, login, signup pages
  const hiddenPaths = ['/', '/login', '/signup'];
  if (hiddenPaths.includes(location.pathname) && !isLoggedIn) return null;

  const navItems = [
    { path: '/home', icon: Home, label: t('होम', 'Home') },
    { path: '/equipment', icon: Tractor, label: t('उपकरण', 'Equipment') },
    { path: '/workers', icon: Users, label: t('मजदूर', 'Workers') },
    { path: '/schemes', icon: FileText, label: t('योजनाएं', 'Schemes') },
    { path: '/assistant', icon: MessageCircle, label: t('AI चैट', 'AI Chat') },
    {
      path: null,
      icon: Phone,
      label: t('कॉल', 'Call'),
      isCall: true,
      href: 'tel:+17179310375',
    },
    { path: '/profile', icon: User, label: t('प्रोफ़ाइल', 'Profile') },
  ];

  return (
    <nav className="navbar navbar-scroll">
      {navItems.map((item, idx) => {
        if (item.isCall) {
          return (
            <a
              key={idx}
              href={item.href}
              className="nav-item nav-item-call"
            >
              <item.icon />
              <span>{item.label}</span>
            </a>
          );
        }
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
