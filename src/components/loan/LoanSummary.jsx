import React, { useState } from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoanSummary = ({ loans }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const calculateSummary = () => {
    if (!loans || loans.length === 0) {
      return { totalAmount: 0, totalRemaining: 0, totalMonthly: 0 };
    }
    
    return loans.reduce((acc, loan) => {
      if (loan.status === 'active') {
        acc.totalAmount += Number(loan.amount || 0);
        acc.totalRemaining += Number(loan.remaining_amount || 0);
        acc.totalMonthly += Number(loan.monthly_payment || 0);
      }
      return acc;
    }, { totalAmount: 0, totalRemaining: 0, totalMonthly: 0 });
  };

  const summary = calculateSummary();

  if (isLoading) {
    return <Paper className="p-4 mb-4">Loading...</Paper>;
  }

  return (
    <Paper className="p-4 mb-4">
      <Typography variant="h6" className="mb-3">📊 {t('loans.summary.title')}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box className="bg-blue-50 p-3 rounded-lg">
            <Typography variant="subtitle2" color="textSecondary">
              {t('loans.summary.totalBorrowed')}
            </Typography>
            <Typography variant="h5" className="text-blue-700">
              ₹{summary.totalAmount.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box className="bg-red-50 p-3 rounded-lg">
            <Typography variant="subtitle2" color="textSecondary">
              {t('loans.summary.remaining')}
            </Typography>
            <Typography variant="h5" className="text-red-700">
              ₹{summary.totalRemaining.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box className="bg-green-50 p-3 rounded-lg">
            <Typography variant="subtitle2" color="textSecondary">
              {t('loans.summary.monthlyPayment')}
            </Typography>
            <Typography variant="h5" className="text-green-700">
              ₹{summary.totalMonthly.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoanSummary;