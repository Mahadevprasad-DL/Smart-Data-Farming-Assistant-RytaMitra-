import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Ramanna from '../components/Ramanna';

const DashboardCard = ({ title, value, icon, trend, trendValue }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        {trend && (
          <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </div>
      <div className="text-3xl bg-green-50 p-3 rounded-full text-green-600">{icon}</div>
    </div>
  </div>
);

// Add this constant before the Dashboard component
const voiceCommandsList = {
  // Basic Navigation
  'ಮುಖ್ಯ ಪುಟ': 'commands.goToDashboard',
  'ಹೋಮ್ ಪುಟ': 'commands.goToDashboard',
  'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್': 'commands.goToDashboard',

  // Financial Commands
  'ಲೆಕ್ಕ ತೋರಿಸು': 'commands.showTransactions',
  'ವಹಿವಾಟು ತೋರಿಸು': 'commands.showTransactions',
  'ಖಾತೆ ನೋಡು': 'commands.showTransactions',

  // Chart Commands
  'ಚಿತ್ರ ತೋರಿಸು': 'commands.showCharts',
  'ಗ್ರಾಫ್ ತೋರಿಸು': 'commands.showCharts',

  // Livestock Commands
  'ದನದ ಲೆಕ್ಕ': 'commands.showCow',
  'ಹಸು ವಿವರ': 'commands.showCow',
  'ಕೋಳಿ ಲೆಕ್ಕ': 'commands.showChicken',
  'ಕೋಳಿ ಮಾಹಿತಿ': 'commands.showChicken',

  // Government Schemes
  'ಯೋಜನೆಗಳು': 'commands.showSchemes',
  'ಸರಕಾರಿ ಯೋಜನೆ': 'commands.showSchemes',
  'ಸಹಾಯಧನ': 'commands.showSchemes',

  // Loan Related
  'ಸಾಲ': 'commands.showLoans',
  'ಸಾಲ ತೋರಿಸು': 'commands.showLoans',
  'ಬ್ಯಾಂಕ್ ಸಾಲ': 'commands.showLoans',

  // Agriculture Related
  'ಕೃಷಿ': 'commands.showAgriculture',
  'ಬೆಳೆ ಮಾಹಿತಿ': 'commands.showAgriculture',
  'ಬೆಳೆ ನೋಡು': 'commands.showAgriculture',

  // Disease Detection
  'ರೋಗ ಪತ್ತೆ': 'commands.showDisease',
  'ಸಸ್ಯ ರೋಗ': 'commands.showDisease',
  'ಬೆಳೆ ರೋಗ': 'commands.showDisease',

  // Flood Alert
  'ಪ್ರವಾಹ': 'commands.showFloodAlert',
  'ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ': 'commands.showFloodAlert',
  'ನೆರೆ ಮಾಹಿತಿ': 'commands.showFloodAlert',

  // Irrigation
  'ನೀರಾವರಿ': 'commands.showIrrigation',
  'ನೀರು ಹಾಕುವುದು': 'commands.showIrrigation',
  'ನೀರು ನಿರ್ವಹಣೆ': 'commands.showIrrigation'
};

// Organize commands by category for better display
const commandCategories = {
  navigation: {
    title: 'ನ್ಯಾವಿಗೇಶನ್',
    commands: ['ಮುಖ್ಯ ಪುಟ', 'ಹಿಂದೆ ಹೋಗು']
  },
  financial: {
    title: 'ಆರ್ಥಿಕ',
    commands: ['ಲೆಕ್ಕ ತೋರಿಸು', 'ಚಿತ್ರ ತೋರಿಸು']
  },
  livestock: {
    title: 'ಪಶುಸಂಗೋಪನೆ',
    commands: ['ದನದ ಲೆಕ್ಕ', 'ಕೋಳಿ ಲೆಕ್ಕ']
  },
  agriculture: {
    title: 'ಕೃಷಿ',
    commands: ['ಕೃಷಿ', 'ರೋಗ ಪತ್ತೆ', 'ಪ್ರವಾಹ', 'ನೀರಾವರಿ']
  },
  schemes: {
    title: 'ಯೋಜನೆಗಳು & ಸಾಲ',
    commands: ['ಯೋಜನೆಗಳು', 'ಸಾಲ']
  }
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (i18n.language === 'kn') {
      return new Date().toLocaleDateString('kn-IN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString();
  };

  const recentTransactions = [
    { id: 1, type: 'credit', amount: '₹12,000', description: t('transactions.milkSale'), date: '2024-03-15' },
    { id: 2, type: 'debit', amount: '₹5,000', description: t('transactions.feedPurchase'), date: '2024-03-14' },
    { id: 3, type: 'credit', amount: '₹8,000', description: t('transactions.cropSale'), date: '2024-03-13' },
  ];

  const activeSchemes = [
    { id: 1, name: t('schemes.pmKisan'), amount: '₹6,000', status: t('status.active'), dueDate: '2024-04-01' },
    { id: 2, name: t('schemes.cropInsurance'), amount: '₹10,000', status: t('status.pending'), dueDate: '2024-03-25' },
  ];

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <p className="text-gray-600">{t('dashboard.today')}: {formatDate(new Date())}</p>
        <div className="flex flex-wrap gap-2 sm:space-x-4">
          <Ramanna />
          
          <button 
            onClick={() => navigate('/transaction')}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            + {t('dashboard.addTransaction')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard 
          title={t('dashboard.totalBalance')}
          value="₹45,000"
          icon="💰"
          trend="up"
          trendValue="+₹5,000"
        />
        <DashboardCard 
          title={t('dashboard.livestockCount')}
          value="15"
          icon="🐮"
        />
        <DashboardCard 
          title={t('dashboard.pendingPayments')}
          value="₹5,000"
          icon="⏳"
          trend="down"
          trendValue="-₹2,000"
        />
      </div>

      {/* Transactions Section */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-emerald-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-800">{t('dashboard.recentTransactions')}</h2>
              <button className="text-emerald-600 hover:text-emerald-700">{t('dashboard.viewAll')} →</button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'credit' ? '↓' : '↑'}
                    </span>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Schemes Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-emerald-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-800">{t('dashboard.activeSchemes')}</h2>
              <button className="text-emerald-600 hover:text-emerald-700">{t('dashboard.viewAll')} →</button>
            </div>
            <div className="space-y-4">
              {activeSchemes.map(scheme => (
                <div key={scheme.id} className="p-3 border border-emerald-50 rounded-lg hover:bg-emerald-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{scheme.name}</h3>
                      <p className="text-sm text-gray-500">{t('dashboard.dueDate')}: {scheme.dueDate}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      scheme.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {scheme.status}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-medium text-emerald-700">{scheme.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Commands Section */}
      <div className="mt-4 sm:mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
            <span className="mr-2">🎤</span>
            {t('dashboard.voiceCommands')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(commandCategories).map(([key, category]) => (
              <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-emerald-800 mb-2">{category.title}</h4>
                <div className="space-y-1">
                  {category.commands.map(command => (
                    <div key={command} className="text-sm flex items-center gap-2">
                      <span className="text-blue-500 text-xs">🎤</span>
                      <span>{command}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
