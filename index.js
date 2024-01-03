const express = require('express');
const { expressjwt: jwt } = require("express-jwt");
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;
require('dotenv').config();
// ระบุโฟลเดอร์ที่มีรูปภาพเป็น static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.static('public', { maxAge: '1d' }));
app.use(jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
}).unless({
    //ระบุค่าเพื่อไม่ให้เช็ค JWT
    path: [
        '/authen/login',
        '/authen/verify',
    ]
}));

// Define a middleware function to handle UnauthorizedError
app.use((err, req, res, next) => {
    if (err) {
        try {
            // Check if the error is a known type, like UnauthorizedError
            if (err.name === 'UnauthorizedError') {
                res.status(401).send({ error: 'UnauthorizedError' });
            } else {
                // Handle other types of errors
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } catch (err) {
            // Handle any unexpected errors during error handling
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // Continue to the next middleware
        next();
    }
});
// Require the file with your CRUD route functions
const loginRouter = require('./Authentication');
const usersRouter = require('./Routers/Users');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: ''
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.use('/authen', loginRouter(connection));
app.use('/user', usersRouter(connection));
