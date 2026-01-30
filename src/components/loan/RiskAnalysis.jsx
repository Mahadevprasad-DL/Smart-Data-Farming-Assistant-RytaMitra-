import React, { useState } from 'react';
import { Grid, Card, CardContent, TextField, Button, Typography, Alert, Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

const RiskAnalysis = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    existingEMIs: '',
    expenses: '',
    loanAmount: '',
    loanTenure: '',
    otherIncome: '' // For seasonal income
  });
  const [analysis, setAnalysis] = useState(null);

  const calculateMonthlyEMI = (principal, rate, tenure) => {
    const monthlyRate = (rate / 100) / 12;
    const months = tenure * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0.00';
    return Number(value).toFixed(2);
  };

  const formatIndianCurrency = (value) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0).replace('₹', '');
    } catch (error) {
      return '0';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        monthlyIncome,
        existingEMIs,
        expenses,
        loanAmount,
        loanTenure,
        otherIncome
      } = formData;

      const totalMonthlyIncome = (Number(monthlyIncome) || 0) + ((Number(otherIncome) || 0) / 12);
      const totalMonthlyObligations = (Number(existingEMIs) || 0) + (Number(expenses) || 0);
      const debtToIncomeRatio = totalMonthlyObligations / (totalMonthlyIncome || 1);
      const proposedEMI = loanAmount && loanTenure ? 
        calculateMonthlyEMI(Number(loanAmount), 12, Number(loanTenure)) : 0;

      const analysis = {
        maxEligibleAmount: totalMonthlyIncome * 60,
        debtToIncomeRatio: debtToIncomeRatio * 100,
        proposedEMI,
        monthlyEMICapacity: totalMonthlyIncome * 0.5 - (Number(existingEMIs) || 0),
        recommendedSavings: totalMonthlyIncome * 0.2,
        riskLevel: debtToIncomeRatio > 0.5 ? 'high' : debtToIncomeRatio > 0.3 ? 'medium' : 'low',
        canAffordLoan: proposedEMI <= (totalMonthlyIncome * 0.5 - (Number(existingEMIs) || 0)),
        monthlySurplus: totalMonthlyIncome - totalMonthlyObligations - proposedEMI
      };

      setAnalysis(analysis);
    } catch (error) {
      console.error('Analysis calculation error:', error);
    }
  };

  return (
    <div className="p-2 md:p-6">
      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} lg={6}>
          <Card className="h-full">
            <CardContent className="space-y-4">
              <Typography variant="h6" gutterBottom>
                {t('loans.analysis.title')}
              </Typography>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Make inputs stack vertically on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    fullWidth
                    label={t('loans.analysis.monthlyIncome')}
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                    required
                  />
                  <TextField
                    fullWidth
                    label={t('loans.analysis.existingLoans')}
                    type="number"
                    value={formData.existingEMIs}
                    onChange={(e) => setFormData({...formData, existingEMIs: e.target.value})}
                    required
                  />
                  <TextField
                    fullWidth
                    label={t('loans.analysis.expenses')}
                    type="number"
                    value={formData.expenses}
                    onChange={(e) => setFormData({...formData, expenses: e.target.value})}
                    required
                  />
                  <TextField
                    fullWidth
                    label={t('loans.analysis.otherIncome')}
                    type="number"
                    value={formData.otherIncome}
                    onChange={(e) => setFormData({...formData, otherIncome: e.target.value})}
                    helperText={t('loans.analysis.otherIncomeHelper')}
                  />
                  <TextField
                    fullWidth
                    label={t('loans.analysis.loanAmount')}
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                    required
                  />
                  <TextField
                    fullWidth
                    label={t('loans.analysis.loanTenure')}
                    type="number"
                    value={formData.loanTenure}
                    onChange={(e) => setFormData({...formData, loanTenure: e.target.value})}
                    required
                  />
                  <TextField
                    fullWidth
                    label={t('loans.analysis.creditScore')}
                    type="number"
                    value={formData.creditScore}
                    onChange={(e) => setFormData({...formData, creditScore: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  className="mt-4"
                >
                  {t('loans.analysis.analyze')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        {analysis && (
          <Grid item xs={12} lg={6}>
            <Card className="h-full">
              <CardContent className="space-y-4">
                <Typography variant="h6" gutterBottom>
                  {t('loans.analysis.simpleResults.title')}
                </Typography>
                
                <Alert severity={analysis.canAffordLoan ? "success" : "error"}>
                  {t(`loans.analysis.simpleResults.${analysis.canAffordLoan ? 'canTakeLoan' : 'cannotTakeLoan'}`)}
                </Alert>

                <Box sx={{ mt: 3, mb: 2 }}>
                  <Alert severity={analysis.riskLevel === 'low' ? 'success' : analysis.riskLevel === 'medium' ? 'warning' : 'error'}>
                    {t(`loans.analysis.simpleResults.riskLevels.${analysis.riskLevel}`)}
                  </Alert>
                </Box>

                <Stack spacing={2}>
                  <Typography variant="body1">
                    {t('loans.analysis.simpleResults.maxLoanPossible', {
                      amount: formatIndianCurrency(analysis.maxEligibleAmount)
                    })}
                  </Typography>
                  
                  <Typography variant="body1">
                    {t('loans.analysis.simpleResults.monthlyPayment', {
                      amount: formatIndianCurrency(analysis.proposedEMI)
                    })}
                  </Typography>

                  <Typography variant="body1">
                    {t('loans.analysis.simpleResults.monthlyCapacity', {
                      amount: formatIndianCurrency(analysis.monthlyEMICapacity)
                    })}
                  </Typography>

                  <Typography variant="body1">
                    {t('loans.analysis.simpleResults.surplus', {
                      amount: formatIndianCurrency(analysis.monthlySurplus)
                    })}
                  </Typography>

                  <Typography variant="body1">
                    {t('loans.analysis.simpleResults.savingSuggestion', {
                      amount: formatIndianCurrency(analysis.recommendedSavings)
                    })}
                  </Typography>
                </Stack>

                <Box sx={{ mt: 3 }}>
                  <Alert severity="info">
                    {t(`loans.analysis.simpleResults.recommendations.${analysis.canAffordLoan ? 'good' : 'bad'}`)}
                    <br />
                    {t('loans.analysis.simpleResults.recommendations.savings')}
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default RiskAnalysis;