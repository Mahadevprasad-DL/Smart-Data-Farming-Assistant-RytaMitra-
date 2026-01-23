const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rytamitra',
  password: '945830',
  port: 5432,
})

// Add error handling for database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Do not exit the process here. Keep server running and handle DB errors per-request.
});

// Flag indicating whether DB is available
let dbAvailable = false;

// Database initialization
const initDb = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    dbAvailable = true;

    try {
      await client.query('BEGIN');

      // Create farmer_loans table with proper constraints
      await client.query(`
        CREATE TABLE IF NOT EXISTS farmer_loans (
          id SERIAL PRIMARY KEY,
          farmer_id INTEGER NOT NULL,
          bank_name VARCHAR(100) NOT NULL,
          loan_type VARCHAR(100) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          interest_rate DECIMAL(5,2) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          monthly_payment DECIMAL(10,2) NOT NULL,
          remaining_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query('COMMIT');
      console.log('Database tables initialized successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    dbAvailable = false;
    console.error('Database initialization warning: DB not available, continuing without DB. Error:', err.message || err);
    // Do not exit; keep server running so frontend can load. Endpoints that require DB will return errors.
  }
}

// Initialize database on startup
initDb()

// Endpoints for transactions
app.post('/api/transactions', async (req, res) => {
  try {
    const { type, amount, description } = req.body
    const result = await pool.query(
      'INSERT INTO transactions (type, amount, description) VALUES ($1, $2, $3) RETURNING *',
      [type, amount, description]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add this new endpoint before the existing livestock endpoints
app.delete('/api/livestock/:type', async (req, res) => {
  try {
    await pool.query('DELETE FROM livestock WHERE type = $1', [req.params.type]);
    res.json({ message: 'Livestock data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoints for livestock
app.post('/api/livestock', async (req, res) => {
  try {
    const { type, count, dailyProduction } = req.body
    const result = await pool.query(
      'INSERT INTO livestock (type, count, daily_production) VALUES ($1, $2, $3) RETURNING *',
      [type, count, dailyProduction]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/livestock/:type', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM livestock WHERE type = $1', [req.params.type])
    res.json(result.rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add new endpoints for crop transactions
app.post('/api/crop-transactions', async (req, res) => {
  try {
    const { item_name, quantity, price, buyer_name } = req.body;
    
    // Log incoming request data
    console.log('Received crop transaction:', req.body);
    
    // Validate inputs
    if (!item_name || !quantity || !price || !buyer_name) {
      console.error('Missing required fields:', { item_name, quantity, price, buyer_name });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { item_name, quantity, price, buyer_name }
      });
    }

    // Execute database query with underscore naming
    const result = await pool.query(
      `INSERT INTO crop_transactions 
       (item_name, quantity, price, buyer_name) 
       VALUES ($1, $2::numeric, $3::numeric, $4) 
       RETURNING *`,
      [item_name.trim(), Number(quantity), Number(price), buyer_name.trim()]
    );
    
    console.log('Database response:', result.rows[0]);
    res.json(result.rows[0]);

  } catch (err) {
    console.error('Detailed error in /api/crop-transactions:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    res.status(500).json({ 
      error: 'Server error processing transaction',
      details: err.message
    });
  }
});

app.get('/api/crop-transactions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crop_transactions ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoints for loan management
app.post('/api/farmer-loans', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { bank_name, loan_type, amount, interest_rate, start_date, end_date } = req.body;
    
    // Validate inputs
    if (!amount || !interest_rate || !start_date || !end_date || !bank_name) {
      return res.status(400).json({ 
        error: 'Missing required loan details'
      });
    }

    const monthly_payment = calculateMonthlyPayment(
      Number(amount),
      Number(interest_rate),
      start_date,
      end_date
    );

    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO farmer_loans 
       (farmer_id, bank_name, loan_type, amount, interest_rate, start_date, end_date, 
        monthly_payment, remaining_amount, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active') 
       RETURNING *`,
      [1, bank_name, loan_type || 'General', amount, interest_rate, start_date, end_date, 
       monthly_payment, amount]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding loan:', err);
    res.status(500).json({ 
      error: 'Failed to add loan',
      details: err.message
    });
  } finally {
    client.release();
  }
});

app.get('/api/farmer-loans', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM farmer_loans ORDER BY id DESC'
    );
    
    // Check if database query was successful
    if (!result || !result.rows) {
      throw new Error('Failed to fetch loans data');
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch loans',
      details: err.message 
    });
  }
});

app.get('/api/bank-loan-offers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bank_loan_offers ORDER BY bank_name, interest_rate_min');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fd-rates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fd_rates ORDER BY bank_name, duration_days');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new endpoint for loan risk analysis
app.post('/api/loan-risk-analysis', async (req, res) => {
  try {
    const { monthlyIncome, existingEMIs, expenses, creditScore } = req.body;
    
    // Calculate debt-to-income ratio
    const dti = (existingEMIs / monthlyIncome) * 100;
    
    // Calculate maximum eligible loan amount
    const maxEligible = calculateMaxLoanAmount(monthlyIncome, existingEMIs, expenses, creditScore);
    
    // Generate repayment scenarios
    const scenarios = generateRepaymentScenarios(maxEligible);
    
    res.json({
      riskLevel: calculateRiskLevel(dti, creditScore),
      maxEligibleAmount: maxEligible,
      recommendedEMI: calculateRecommendedEMI(maxEligible, monthlyIncome),
      scenarios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new endpoint to get loan statistics
app.get('/api/farmer-loans/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_loans,
        SUM(amount) as total_amount,
        SUM(remaining_amount) as total_remaining,
        SUM(monthly_payment) as total_monthly_payment
      FROM farmer_loans 
      WHERE status = 'active'
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to calculate monthly loan payment
function calculateMonthlyPayment(principal, annualRate, startDate, endDate) {
  if (!principal || !annualRate || !startDate || !endDate) {
    throw new Error('Missing required parameters for EMI calculation');
  }

  const monthlyRate = (annualRate / 12) / 100;
  const durationMonths = Math.ceil((new Date(endDate) - new Date(startDate)) / (30 * 24 * 60 * 60 * 1000));
  
  if (durationMonths <= 0) {
    throw new Error('Invalid loan duration');
  }

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
             (Math.pow(1 + monthlyRate, durationMonths) - 1);
  return Math.round(emi * 100) / 100;
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
