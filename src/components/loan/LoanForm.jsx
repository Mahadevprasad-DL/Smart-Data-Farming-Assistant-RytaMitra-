import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Typography, IconButton
} from '@mui/material';
import { bankLoanOffers } from '../../data/bankData';

const LoanForm = ({ open, onClose, onSubmit, formData, onChange }) => {
  const [previewEMI, setPreviewEMI] = useState(0);
  const [selectedBank, setSelectedBank] = useState(null);

  const validateForm = () => {
    const errors = [];
    if (!formData.bank_name) errors.push('Bank name is required');
    if (!formData.amount || formData.amount <= 0) errors.push('Valid amount is required');
    if (!formData.interest_rate || formData.interest_rate <= 0) errors.push('Valid interest rate is required');
    if (!formData.start_date) errors.push('Start date is required');
    if (!formData.end_date) errors.push('End date is required');
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.push('End date must be after start date');
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    onSubmit(e);
  };

  useEffect(() => {
    if (formData.bank_name) {
      setSelectedBank(bankLoanOffers.find(bank => bank.bank_name === formData.bank_name));
    }
  }, [formData.bank_name]);

  // Calculate EMI
  useEffect(() => {
    if (formData.amount && formData.interest_rate && formData.start_date && formData.end_date) {
      const monthlyRate = formData.interest_rate / 12 / 100;
      const durationMonths = Math.ceil(
        (new Date(formData.end_date) - new Date(formData.start_date)) / (30 * 24 * 60 * 60 * 1000)
      );
      
      if (durationMonths > 0 && monthlyRate > 0) {
        const emi = (formData.amount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
                   (Math.pow(1 + monthlyRate, durationMonths) - 1);
        setPreviewEMI(Math.round(emi * 100) / 100);
      }
    }
  }, [formData.amount, formData.interest_rate, formData.start_date, formData.end_date]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            Add New Loan
          </div>
        </div>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Bank Name */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Bank Name *</InputLabel>
                <Select
                  value={formData.bank_name}
                  onChange={(e) => {
                    const bank = bankLoanOffers.find(b => b.bank_name === e.target.value);
                    onChange({
                      ...formData,
                      bank_name: e.target.value,
                      interest_rate: bank ? bank.interest_rate_min : '',
                      loan_type: bank ? bank.loan_type?.en || 'General' : ''
                    });
                  }}
                >
                  {bankLoanOffers.map(bank => (
                    <MenuItem key={bank.bank_name} value={bank.bank_name}>
                      <div className="flex items-center gap-2">
                        <span>{bank.bank_logo || '🏦'}</span>
                        <span>{bank.bank_name}</span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Loan Amount */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Loan Amount (₹) *"
                type="number"
                value={formData.amount}
                onChange={(e) => onChange({...formData, amount: e.target.value})}
                placeholder="5000"
              />
            </Grid>

            {/* Interest Rate */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Interest Rate (%) *"
                type="number"
                step="0.1"
                value={formData.interest_rate}
                onChange={(e) => onChange({...formData, interest_rate: e.target.value})}
                helperText={selectedBank && 
                  `Range: ${selectedBank.interest_rate_min || 0}% - ${selectedBank.interest_rate_max || 9}%`}
              />
            </Grid>

            {/* Tenure (Months) */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tenure (Months) *"
                type="number"
                value={formData.tenure}
                onChange={(e) => {
                  const months = Number(e.target.value);
                  const startDate = new Date();
                  const endDate = new Date();
                  endDate.setMonth(endDate.getMonth() + months);
                  
                  onChange({
                    ...formData,
                    tenure: e.target.value,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                  });
                }}
                placeholder="6"
              />
            </Grid>

            {/* Start Date (Hidden but used for calculation) */}
            <Grid item xs={12} style={{display: 'none'}}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.start_date}
                onChange={(e) => onChange({...formData, start_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* End Date (Hidden but used for calculation) */}
            <Grid item xs={12} style={{display: 'none'}}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.end_date}
                onChange={(e) => onChange({...formData, end_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Loan Preview */}
            <Grid item xs={12}>
              <Paper className="p-4 bg-blue-50">
                <Typography variant="h6" className="mb-3 flex items-center gap-2">
                  💰 Loan Preview
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Loan Amount:</span>
                    <span className="font-semibold">₹{Number(formData.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Payment:</span>
                    <span className="font-semibold text-green-600">₹{previewEMI.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{formData.tenure || 0} months</span>
                  </div>
                  {selectedBank && (
                    <div className="text-sm text-gray-600 mt-2">
                      <Typography variant="caption" display="block">
                        🎁 Special Features:
                      </Typography>
                      {selectedBank.special_features?.en?.map((feature, idx) => (
                        <Typography key={idx} variant="caption" display="block">
                          • {feature}
                        </Typography>
                      ))}
                    </div>
                  )}
                </div>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">CANCEL</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.bank_name || !formData.amount || !formData.interest_rate || !formData.tenure}
          >
            ✓ SAVE
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoanForm;