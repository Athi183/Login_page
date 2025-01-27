const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors());
app.use(express.json()); // Add this middleware

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'A1835Thira@2025',
    database: 'Login',
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Register Route
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body; // Now req.body will be defined
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [name, email, hashedPassword], (err, results) => {
                if (err) return res.status(500).json({ message: 'Error registering user' });
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
});

// Login Route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking user' });
        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            res.json({ message: 'Login successful' });
        });
    });
});
