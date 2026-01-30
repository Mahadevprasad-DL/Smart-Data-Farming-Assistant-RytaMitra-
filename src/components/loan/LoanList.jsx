import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoanList = ({ loans }) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('loans.form.bankName')}</TableCell>
            <TableCell>{t('loans.form.loanType')}</TableCell>
            <TableCell>{t('loans.form.amount')}</TableCell>
            <TableCell>{t('loans.form.monthlyPayment')}</TableCell>
            <TableCell>{t('loans.form.remainingAmount')}</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell>{loan.bank_name}</TableCell>
              <TableCell>{loan.loan_type}</TableCell>
              <TableCell>₹{Number(loan.amount).toLocaleString()}</TableCell>
              <TableCell>₹{Number(loan.monthly_payment || 0).toLocaleString()}</TableCell>
              <TableCell>₹{Number(loan.remaining_amount || 0).toLocaleString()}</TableCell>
              <TableCell>
                <Chip
                  label={loan.status || 'active'}
                  color={loan.status === 'active' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LoanList;