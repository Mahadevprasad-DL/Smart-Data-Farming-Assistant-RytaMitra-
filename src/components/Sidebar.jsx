import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileMenuOpen, setMobileMenuOpen }) => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  const menuItems = [
    { path: '/', label: t('sidebar.dashboard'), icon: '🏠' },
    { path: '/charts', label: t('sidebar.charts'), icon: '📈' },
    { path: '/transaction', label: t('sidebar.transactions'), icon: '💸' },
    { path: '/loan', label: t('sidebar.loans'), icon: '🏦' },
    { path: '/scheme', label: t('sidebar.schemes'), icon: '📋' },
    { path: '/agriculture', label: t('sidebar.agriculture'), icon: '🌾' },
    {
      path: '/animals',
      label: t('sidebar.animals'),
      icon: '🐮',
      submenu: [
        { path: '/cow', label: t('sidebar.cow'), icon: '🐄' },
        { path: '/chicken', label: t('sidebar.chicken'), icon: '🐔' }
      ]
    }
  ];

  // Color configurations based on theme
  const colors = isDarkMode ? {
    bg: 'bg-slate-900',
    bgAlt: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    hoverBg: 'hover:bg-slate-700/50',
    activeBg: 'bg-slate-700',
    activeText: 'text-white',
    backdropDark: 'bg-black/60',
    scrollbar: 'scrollbar-thumb-slate-700',
    buttonHover: 'hover:bg-slate-700',
    subitemActive: 'bg-slate-700/70',
    subitemHover: 'hover:bg-slate-700/30',
  } : {
    bg: 'bg-emerald-800',
    bgAlt: 'bg-emerald-700',
    border: 'border-emerald-700',
    text: 'text-white',
    textMuted: 'text-emerald-100',
    hoverBg: 'hover:bg-emerald-700/50',
    activeBg: 'bg-emerald-700',
    activeText: 'text-white',
    backdropDark: 'bg-black/50',
    scrollbar: 'scrollbar-thumb-emerald-700',
    buttonHover: 'hover:bg-emerald-700',
    subitemActive: 'bg-emerald-700/70',
    subitemHover: 'hover:bg-emerald-700/30',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className={`fixed inset-0 ${colors.backdropDark} backdrop-blur-sm z-40 md:hidden transition-colors duration-300`}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0
        flex flex-col
        ${isCollapsed ? 'w-20' : 'w-72'}
        transition-all duration-300 
        ${colors.bg} ${colors.text}
        h-screen
        z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-2xl
      `}>
        {/* Header */}
        <div className={`p-4 border-b ${colors.border} flex items-center justify-between transition-colors duration-300`}>
          {!isCollapsed && (
            <span className={`text-xl font-bold ${colors.text}`}>
              {t('topbar.appName')}
            </span>
          )}
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            <button
              className={`md:hidden p-2 rounded-lg ${colors.buttonHover} ${colors.textMuted} transition-colors`}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
            {/* Desktop collapse button */}
            <button
              className={`hidden md:block p-2 rounded-lg ${colors.buttonHover} ${colors.textMuted} transition-colors`}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto mt-6 px-2 scrollbar-thin ${colors.scrollbar} scrollbar-track-transparent`}>
          {menuItems.map((item) => (
            <div key={item.path} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? `${colors.activeBg} ${colors.activeText} shadow-lg` 
                      : `${colors.textMuted} ${colors.hoverBg}`
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>

              {/* Submenu items */}
              {!isCollapsed && item.submenu?.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center pl-12 pr-4 py-2 rounded-lg mt-1 transition-all duration-200 ${
                      isActive 
                        ? `${colors.subitemActive} ${colors.activeText} shadow-md` 
                        : `${colors.textMuted} ${colors.subitemHover}`
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg flex-shrink-0">{subItem.icon}</span>
                  <span className="ml-3 text-xs font-medium whitespace-nowrap">
                    {subItem.label}
                  </span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer with theme indicator */}
        <div className={`p-4 border-t ${colors.border} text-center`}>
          <div className={`flex items-center justify-center gap-2 text-xs ${colors.textMuted}`}>
            <span className={`inline-block w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
            <span className="hidden sm:inline">
              {isDarkMode ? '🌙 Dark' : '☀️ Light'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
