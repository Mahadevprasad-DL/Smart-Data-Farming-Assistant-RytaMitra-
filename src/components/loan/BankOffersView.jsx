import React, { useState } from 'react';
import { Typography, Paper, Tooltip, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { bankLoanOffers, loanGuide } from '../../data/bankData';

const BankOffersView = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language === 'kn' ? 'kn' : 'en';
  const [selectedRisk, setSelectedRisk] = useState('all');

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'bg-green-100 border-green-500 text-green-700';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'high': return 'bg-red-100 border-red-500 text-red-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getLanguageIcon = (lang) => {
    switch(lang) {
      case 'kannada': return '🇰';
      case 'hindi': return '🇮🇳';
      case 'english': return '🇬🇧';
      default: return '📝';
    }
  };

  const filteredOffers = selectedRisk === 'all' 
    ? bankLoanOffers 
    : bankLoanOffers.filter(bank => bank.risk_level === selectedRisk);

  return (
    <div className="space-y-6">
      {/* Visual Risk Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Paper 
          className={`p-4 cursor-pointer ${selectedRisk === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedRisk('all')}
        >
          <div className="text-center">
            <span className="text-3xl">🏦</span>
            <Typography className="mt-2">{t('loans.filter.all')}</Typography>
          </div>
        </Paper>
        {['low', 'medium', 'high'].map(risk => (
          <Paper 
            key={risk}
            className={`p-4 cursor-pointer ${getRiskColor(risk)} ${
              selectedRisk === risk ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedRisk(risk)}
          >
            <div className="text-center">
              <span className="text-3xl">
                {risk === 'low' ? '✅' : risk === 'medium' ? '⚠️' : '⚡'}
              </span>
              <Typography className="mt-2">{t(`loans.risk.${risk}`)}</Typography>
            </div>
          </Paper>
        ))}
      </div>

      {/* Simplified Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((bank) => (
          <Paper 
            key={bank.bank_name} 
            className={`overflow-hidden ${getRiskColor(bank.risk_level)}`}
          >
            {/* Bank Header */}
            <div className="p-4 bg-white border-b">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{bank.bank_logo}</span>
                <div>
                  <Typography variant="h6">{bank.bank_name}</Typography>
                  <Typography variant="subtitle2" className="text-gray-600">
                    {bank.loan_type[currentLanguage]}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-4 space-y-4">
              {/* Interest Rate */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-lg font-bold text-green-700">
                  💰 {bank.interest_rate_min}% - {bank.interest_rate_max}%
                </div>
                <div className="text-sm text-gray-600">
                  {bank.payment_example[currentLanguage]}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                {bank.special_features[currentLanguage].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded">
                    {feature}
                  </div>
                ))}
              </div>

              {/* Quick Requirements */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <Typography variant="subtitle2" className="mb-2">
                  {t('loans.requirements.title')}:
                </Typography>
                {bank.simple_eligibility[currentLanguage].map((criteria, idx) => (
                  <div key={idx} className="text-sm">{criteria}</div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-2">
                  {bank.local_language_support.map(lang => (
                    <Tooltip key={lang} title={t(`loans.language.${lang}`)} arrow>
                      <span className="text-xl">{getLanguageIcon(lang)}</span>
                    </Tooltip>
                  ))}
                </div>
                <Typography className="text-blue-600">
                  📞 {bank.helpline}
                </Typography>
              </div>
            </div>
          </Paper>
        ))}
      </div>
    </div>
  );
};

export default BankOffersView;
