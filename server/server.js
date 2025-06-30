import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool, { testConnection, initializeDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-immediately';

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Initialize database on startup
const initializeApp = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot start server: Database connection failed');
    console.log('📋 Please ensure XAMPP MySQL is running and check your database configuration');
    process.exit(1);
  }

  const isInitialized = await initializeDatabase();
  if (!isInitialized) {
    console.error('❌ Cannot start server: Database initialization failed');
    process.exit(1);
  }

  // Create default admin if not exists
  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await pool.execute('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('✅ Default admin created: username=admin, password=admin123');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation rules
const employeeValidation = [
  body('first_name').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
  body('last_name').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('position').trim().isLength({ min: 1, max: 100 }).withMessage('Position is required and must be less than 100 characters'),
  body('department').trim().isLength({ min: 1, max: 100 }).withMessage('Department is required and must be less than 100 characters'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('hire_date').isDate().withMessage('Valid hire date is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('address').optional().isLength({ max: 200 }).withMessage('Address must be less than 200 characters')
];

// Auth routes
app.post('/api/auth/login', authLimiter, [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid input', details: errors.array() });
  }

  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
    const admin = rows[0];
    
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Employee CRUD routes
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.get('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    const employee = rows[0];
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

app.post('/api/employees', authenticateToken, employeeValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { first_name, last_name, email, position, department, salary, hire_date, phone, address } = req.body;
  
  try {
    // Check for duplicate email
    const [existingRows] = await pool.execute('SELECT * FROM employees WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }

    const [result] = await pool.execute(
      `INSERT INTO employees (first_name, last_name, email, position, department, salary, hire_date, phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, position, department, salary, hire_date, phone, address]
    );
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', authenticateToken, employeeValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { first_name, last_name, email, position, department, salary, hire_date, phone, address } = req.body;
  
  try {
    // Check if employee exists
    const [existingRows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check for duplicate email (excluding current employee)
    const [duplicateRows] = await pool.execute('SELECT * FROM employees WHERE email = ? AND id != ?', [email, req.params.id]);
    if (duplicateRows.length > 0) {
      return res.status(409).json({ error: 'Another employee with this email already exists' });
    }

    await pool.execute(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, email = ?, position = ?, department = ?, 
           salary = ?, hire_date = ?, phone = ?, address = ?
       WHERE id = ?`,
      [first_name, last_name, email, position, department, salary, hire_date, phone, address, req.params.id]
    );
    
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Another employee with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const [existingRows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await pool.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Initialize and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:5173`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
});