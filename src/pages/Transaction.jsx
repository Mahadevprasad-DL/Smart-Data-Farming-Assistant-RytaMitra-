import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Select, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, CardContent, CardActions } from '@mui/material';
import VoiceInput from '../components/VoiceInput';
import supabase from '../supabaseClient';

const Transaction = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [cropTransactions, setCropTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState('regular'); // 'regular' or 'crop'
  const [openDialog, setOpenDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'credit',
    amount: '',
    description: ''
  });

  // Crop form state
  const [cropFormOpen, setCropFormOpen] = useState(false);
  const [cropForm, setCropForm] = useState({
    item_name: '',
    quantity: '',
    price: '',
    buyer_name: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchCropTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchCropTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setCropTransactions(data || []);
    } catch (err) {
      console.error('Error fetching crop transactions:', err);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const payload = {
        ...transactionData,
        amount: typeof transactionData.amount === 'string' ? parseFloat(transactionData.amount) : transactionData.amount,
        date: new Date().toISOString()
      };
      const { data, error } = await supabase.from('transactions').insert(payload).select();
      if (error) throw error;
      fetchTransactions();
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTransaction({ type: 'credit', amount: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTransaction(newTransaction);
    handleDialogClose();
  };

  return (
    <Box p={3}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        mb={3} 
        spacing={2}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('sidebar.transactions')}
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Select
            size="small"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            fullWidth={false}
          >
            <MenuItem value="regular">{t('transactions.regular')}</MenuItem>
            <MenuItem value="crop">{t('transactions.crop')}</MenuItem>
          </Select>
          {transactionType === 'regular' && (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenDialog(true)}
                fullWidth={false}
              >
                {t('transactions.add')}
              </Button>
              <Select
                size="small"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                fullWidth={false}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="credit">{t('transactions.type.credit')}</MenuItem>
                <MenuItem value="debit">{t('transactions.type.debit')}</MenuItem>
              </Select>
            </>
          )}
        </Stack>
      </Stack>

      {transactionType === 'regular' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('transactions.date')}</TableCell>
                <TableCell>{t('transactions.description')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {t('transactions.type.credit')}
                </TableCell>
                <TableCell align="right">{t('transactions.amount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(Array.isArray(transactions) ? transactions : [])
                .filter(tx => filter === 'all' || tx.type === filter)
                .map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`transactions.type.${transaction.type}`)}
                        color={transaction.type === 'credit' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: transaction.type === 'credit' ? 'success.main' : 'error.main' }}>
                      {transaction.type === 'credit' ? '+' : '-'} ₹{transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          <Stack direction="row" spacing={2} mb={2}>
            <Button variant="contained" color="primary" onClick={() => setCropFormOpen(true)}>
              {t('transactions.add')}
            </Button>
          </Stack>

          {cropFormOpen && (
            <Card sx={{ mb: 3 }}>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    ...cropForm,
                    quantity: cropForm.quantity === '' ? null : parseFloat(cropForm.quantity),
                    price: cropForm.price === '' ? null : parseFloat(cropForm.price),
                    date: new Date().toISOString()
                  };
                  const { data, error } = await supabase.from('crop_transactions').insert(payload).select();
                  if (error) throw error;
                  setCropForm({ item_name: '', quantity: '', price: '', buyer_name: '' });
                  setCropFormOpen(false);
                  fetchCropTransactions();
                } catch (err) {
                  console.error('Error adding crop transaction:', err);
                }
              }}>
                <CardContent>
                  <Stack spacing={2}>
                    <TextField
                      label={t('dashboard.crops')}
                      value={cropForm.item_name}
                      onChange={(e) => setCropForm({ ...cropForm, item_name: e.target.value })}
                      required
                      fullWidth
                    />
                    <TextField
                      label={t('transactions.amount') + ' (kg)'}
                      type="number"
                      value={cropForm.quantity}
                      onChange={(e) => setCropForm({ ...cropForm, quantity: e.target.value })}
                      required
                      fullWidth
                    />
                    <TextField
                      label={t('transactions.amount') + ' (₹)'}
                      type="number"
                      value={cropForm.price}
                      onChange={(e) => setCropForm({ ...cropForm, price: e.target.value })}
                      required
                      fullWidth
                    />
                    <TextField
                      label={t('transactions.buyer')}
                      value={cropForm.buyer_name}
                      onChange={(e) => setCropForm({ ...cropForm, buyer_name: e.target.value })}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pr: 2, pb: 2 }}>
                  <Button onClick={() => { setCropFormOpen(false); setCropForm({ item_name: '', quantity: '', price: '', buyer_name: '' }); }}>{t('common.cancel')}</Button>
                  <Button type="submit" variant="contained">{t('common.save')}</Button>
                </CardActions>
              </form>
            </Card>
          )}

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {t('transactions.date')}
                  </TableCell>
                  <TableCell>{t('dashboard.crops')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {t('transactions.amount')} (kg)
                  </TableCell>
                  <TableCell align="right">₹/{t('transactions.amount')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {t('transactions.buyer')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cropTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{tx.item_name}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {tx.quantity}
                    </TableCell>
                    <TableCell align="right">₹{tx.price}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {tx.buyer_name}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{t('transactions.addNew')}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <Select
                fullWidth
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
              >
                <MenuItem value="credit">{t('transactions.type.credit')}</MenuItem>
                <MenuItem value="debit">{t('transactions.type.debit')}</MenuItem>
              </Select>
              <TextField
                fullWidth
                label={t('transactions.amount')}
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                required
              />
              <TextField
                fullWidth
                label={t('transactions.description')}
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained">{t('common.save')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Transaction;
