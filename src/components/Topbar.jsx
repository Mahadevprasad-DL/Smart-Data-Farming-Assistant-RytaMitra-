import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिंदी' }
];

const Topbar = ({ isCollapsed, setMobileMenuOpen }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className={`
      fixed top-0 right-0 left-0
      bg-white shadow-md p-4 
      z-30
      transition-all duration-300
      ${isCollapsed ? 'md:left-20' : 'md:left-72'}
    `}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-2xl text-emerald-800 hover:bg-emerald-50 p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-emerald-800">{t('topbar.appName')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            value={i18n.language}
            className="px-2 py-1 md:px-4 md:py-2 text-sm md:text-base border rounded bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-2 focus:ring-emerald-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
