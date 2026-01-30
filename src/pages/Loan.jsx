import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, Button, Typography, Alert } from '@mui/material';
import supabase from '../supabaseClient';
import LoanList from '../components/loan/LoanList';
import LoanForm from '../components/loan/LoanForm';
import BankOffersView from '../components/loan/BankOffersView';
import FDRatesView from '../components/loan/FDRatesView';
import RiskAnalysis from '../components/loan/RiskAnalysis';
import LoanSummary from '../components/loan/LoanSummary';

const Loan = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [myLoans, setMyLoans] = useState([]);
  const [openLoanDialog, setOpenLoanDialog] = useState(false);
  const [newLoan, setNewLoan] = useState({
    bank_name: '',
    loan_type: '',
    amount: '',
    interest_rate: '',
    start_date: '',
    end_date: '',
    tenure: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMyLoans();
  }, []);

  // Calculate monthly payment (EMI)
  const calculateMonthlyPayment = (principal, annualRate, startDate, endDate) => {
    if (!principal || !annualRate || !startDate || !endDate) {
      return 0;
    }

    const monthlyRate = (annualRate / 12) / 100;
    const durationMonths = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (30 * 24 * 60 * 60 * 1000)
    );
    
    if (durationMonths <= 0) {
      return 0;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
               (Math.pow(1 + monthlyRate, durationMonths) - 1);
    
    return Math.round(emi * 100) / 100;
  };

  const fetchMyLoans = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from('farmer_loans')
        .select('*')
        .order('created_timestamp', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setMyLoans(data || []);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setError(err.message || t('loans.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const translateLoanData = (loanData) => {
    const knTranslations = {
      // Common loan types
      "General": "ಸಾಮಾನ್ಯ",
      "Crop Loan": "ಬೆಳೆ ಸಾಲ",
      "Agricultural Loan": "ಕೃಷಿ ಸಾಲ",
      "Rural Loans": "ಗ್ರಾಮೀಣ ಸಾಲಗಳು",
      "Kisan Credit Card": "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್",
    };

    return {
      ...loanData,
      loan_type_kn: knTranslations[loanData.loan_type] || loanData.loan_type,
    };
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsLoading(true);

      // Validate required fields
      if (!newLoan.bank_name || !newLoan.amount || 
          !newLoan.interest_rate || !newLoan.start_date || !newLoan.end_date) {
        throw new Error('All fields are required');
      }

      if (newLoan.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Calculate monthly payment
      const monthlyPayment = calculateMonthlyPayment(
        Number(newLoan.amount),
        Number(newLoan.interest_rate),
        newLoan.start_date,
        newLoan.end_date
      );

      // Prepare loan data for Supabase
      const loanDataToSave = {
        farmer_id: 1, // Default farmer ID - replace with actual user ID
        bank_name: newLoan.bank_name,
        loan_type: newLoan.loan_type || 'General',
        amount: Number(newLoan.amount),
        interest_rate: Number(newLoan.interest_rate),
        start_date: newLoan.start_date,
        end_date: newLoan.end_date,
        monthly_payment: monthlyPayment,
        remaining_amount: Number(newLoan.amount),
        status: 'active'
      };

      // Save to Supabase
      const { data, error: insertError } = await supabase
        .from('farmer_loans')
        .insert([loanDataToSave])
        .select();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Reset form
      setOpenLoanDialog(false);
      setNewLoan({
        bank_name: '',
        loan_type: '',
        amount: '',
        interest_rate: '',
        start_date: '',
        end_date: '',
        tenure: ''
      });
      
      // Refresh loans list
      await fetchMyLoans();
      alert('Loan added successfully!');
      
    } catch (err) {
      console.error('Error adding loan:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 md:p-6 max-w-7xl mx-auto">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label={t('loans.myLoans')} />
        <Tab label={t('loans.bankOffers')} />
        <Tab label={t('loans.fdRates')} />
        <Tab label={t('loans.riskAnalysis')} />
      </Tabs>

      <div className="mt-4 md:mt-6">
        {activeTab === 0 && (
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <LoanSummary loans={myLoans} />
                <div className="flex justify-between items-center">
                  <Typography variant="h6">
                    {t('loans.activeLoansList')} ({myLoans.length})
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<span>➕</span>}
                    onClick={() => setOpenLoanDialog(true)}
                  >
                    {t('loans.addNew')}
                  </Button>
                </div>
                {myLoans.length > 0 ? (
                  <LoanList loans={myLoans} />
                ) : (
                  <Typography className="text-center py-4">
                    {t('loans.noLoansYet')}
                  </Typography>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 1 && <BankOffersView />}
        {activeTab === 2 && <FDRatesView />}
        {activeTab === 3 && <RiskAnalysis />}

        <LoanForm
          open={openLoanDialog}
          onClose={() => setOpenLoanDialog(false)}
          onSubmit={handleAddLoan}
          formData={newLoan}
          onChange={setNewLoan}
        />
      </div>
    </div>
  );
};

export default Loan;
