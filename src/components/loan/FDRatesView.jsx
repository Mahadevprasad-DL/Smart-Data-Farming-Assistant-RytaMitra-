import React, { useState } from 'react';
import { Typography, Paper, Tabs, Tab, TextField, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { fdRates, fdHelpers } from '../../data/fdData';

const FDRatesView = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language === 'kn' ? 'kn' : 'en';
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState("1-2 years");
  const [calculatorValues, setCalculatorValues] = useState({
    amount: 10000,
    interestRate: 7.0,
    years: 1
  });
  const [calculatorResult, setCalculatorResult] = useState(null);

  // Simple FD calculator
  const calculateFD = (amount, days, rate) => {
    const interest = (amount * rate * days) / (365 * 100);
    return Math.round(amount + interest);
  };

  const calculateFDReturn = () => {
    const { amount, interestRate, years } = calculatorValues;
    const interest = (amount * interestRate * years) / 100;
    const totalAmount = amount + interest;
    
    setCalculatorResult({
      originalAmount: amount,
      interestRate: interestRate,
      years: years,
      interestEarned: Math.round(interest),
      totalAmount: Math.round(totalAmount)
    });
  };

  // Transform data for better comparison
  const getComparisonData = () => {
    const durationOptions = [
      "180-364", // 6 months
      "1-2 years", // 1 year
      "2-3 years" // 2 years
    ];

    return fdRates.map(bank => ({
      name: bank.bank_name[currentLanguage],
      bank_type: bank.bank_type,
      ...durationOptions.reduce((acc, duration) => ({
        ...acc,
        [duration]: bank.rates.find(r => r.duration === duration)?.rate || 0
      }), {}),
      senior_rate: bank.senior_citizen_bonus,
      min_deposit: bank.min_deposit
    }));
  };

  return (
    <div className="space-y-6 p-2 md:p-6">
      {/* Main Tabs - Make them scrollable on mobile */}
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        className="bg-white rounded-lg"
      >
        {fdHelpers.tabs[currentLanguage].map((tab, idx) => (
          <Tab key={idx} label={tab} />
        ))}
      </Tabs>

      {/* Popular Banks View */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fdRates.map((bank, idx) => (
            <Paper key={idx} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏦</span>
                <Typography variant="h6">{bank.bank_name[currentLanguage]}</Typography>
              </div>
              
              <div className="space-y-2">
                {/* Best Rate Highlight */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <Typography className="text-green-700">
                    Best Rate: {Math.max(...bank.rates.map(r => r.rate))}%
                  </Typography>
                  {bank.quick_examples[currentLanguage][0]}
                </div>

                {/* Senior Citizen Bonus */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Typography className="text-blue-700">
                    👴 +{bank.senior_citizen_bonus}% for senior citizens
                  </Typography>
                </div>
              </div>
            </Paper>
          ))}
        </div>
      )}

      {/* Comparison View */}
      {activeTab === 1 && (
        <div className="space-y-4">
          {/* Duration Selector */}
          <div className="flex gap-2">
            <Button 
              variant={selectedDuration === "180-364" ? "contained" : "outlined"}
              onClick={() => setSelectedDuration("180-364")}
            >
              6 {t('loans.duration.months')}
            </Button>
            <Button 
              variant={selectedDuration === "1-2 years" ? "contained" : "outlined"}
              onClick={() => setSelectedDuration("1-2 years")}
            >
              1 {t('loans.duration.year')}
            </Button>
            <Button 
              variant={selectedDuration === "2-3 years" ? "contained" : "outlined"}
              onClick={() => setSelectedDuration("2-3 years")}
            >
              2 {t('loans.duration.years')}
            </Button>
          </div>

          {/* Comparison Chart */}
          <Paper className="p-4 overflow-x-auto">
            <div className="min-w-[600px]"> {/* Minimum width for scrolling */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis 
                    label={{ 
                      value: t('loans.interest.rate'), 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                  />
                  <Tooltip 
                    content={({ payload, label }) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow border">
                            <p className="font-bold">{label}</p>
                            <p className="text-green-600">
                              {t('loans.interest.normal')}: {data[selectedDuration]}%
                            </p>
                            <p className="text-blue-600">
                              {t('loans.interest.senior')}: {(data[selectedDuration] + data.senior_rate).toFixed(2)}%
                            </p>
                            <p className="text-gray-600 text-sm">
                              {t('loans.deposit.minimum')}: ₹{data.min_deposit}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey={selectedDuration}
                    fill="#4F46E5"
                    name={t('loans.interest.rate')}
                  >
                    {getComparisonData().map((entry, index) => (
                      <Cell 
                        key={index}
                        fill={entry.bank_type === "Public" ? "#4F46E5" : "#10B981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#4F46E5]" />
                <span>{t('loans.bank.public')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#10B981]" />
                <span>{t('loans.bank.private')}</span>
              </div>
            </div>
          </Paper>

          {/* Quick Tips */}
          <Paper className="p-4 bg-blue-50">
            <Typography variant="h6" className="mb-2">
              💡 {t('loans.tips.title')}
            </Typography>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('loans.tips.compare')}</li>
              <li>{t('loans.tips.senior')}</li>
              <li>{t('loans.tips.duration')}</li>
            </ul>
          </Paper>
        </div>
      )}

      {/* Improved Calculator View */}
      {activeTab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              {t('loans.calculator.fdTitle')}
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextField
                  label={t('loans.calculator.depositAmount')}
                  type="number"
                  value={calculatorValues.amount}
                  onChange={(e) => setCalculatorValues({
                    ...calculatorValues,
                    amount: Number(e.target.value)
                  })}
                  placeholder={t('loans.calculator.amountPlaceholder')}
                  InputProps={{
                    startAdornment: <span className="text-gray-500">₹</span>
                  }}
                  fullWidth
                />
                
                <TextField
                  label={t('loans.calculator.interestRate')}
                  type="number"
                  value={calculatorValues.interestRate}
                  onChange={(e) => setCalculatorValues({
                    ...calculatorValues,
                    interestRate: Number(e.target.value)
                  })}
                  placeholder={t('loans.calculator.ratePlaceholder')}
                  InputProps={{
                    endAdornment: <span className="text-gray-500">%</span>
                  }}
                  fullWidth
                />
                
                <TextField
                  label={t('loans.calculator.depositYears')}
                  type="number"
                  value={calculatorValues.years}
                  onChange={(e) => setCalculatorValues({
                    ...calculatorValues,
                    years: Number(e.target.value)
                  })}
                  placeholder={t('loans.calculator.yearsPlaceholder')}
                  fullWidth
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={calculateFDReturn}
                  fullWidth
                >
                  {t('loans.calculator.calculate')}
                </Button>
              </div>

              {calculatorResult && (
                <Paper className="p-4 bg-blue-50">
                  <Typography variant="h6" className="mb-3">
                    {t('loans.calculator.result.title')}
                  </Typography>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{t('loans.calculator.result.depositAmount')}:</span>
                      <span className="font-bold">₹{calculatorResult.originalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('loans.calculator.result.interestRate')}:</span>
                      <span className="font-bold">{calculatorResult.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('loans.calculator.result.timePeriod')}:</span>
                      <span className="font-bold">{calculatorResult.years} {t('loans.duration.years')}</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>{t('loans.calculator.result.interestEarned')}:</span>
                      <span className="font-bold">₹{calculatorResult.interestEarned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-700 font-bold">
                      <span>{t('loans.calculator.result.totalAmount')}:</span>
                      <span>₹{calculatorResult.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </Paper>
              )}
            </div>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default FDRatesView;