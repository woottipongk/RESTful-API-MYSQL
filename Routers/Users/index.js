const express = require('express');
const { check, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
const router = express.Router();
module.exports = (connection) => {

  // Read all users
  router.get('/all', (req, res) => {
    connection.query('SELECT * FROM user_details', (err, results) => {
      if (err) {
        // หากมีข้อผิดพลาดในการ query
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        // ถ้าไม่พบข้อมูล
        return res.status(404).json({ error: 'Data not found' });
      }

      res.json(results);
    });
  });

  // Read a single user
  router.get('/:username', [
    check('username').isInt().withMessage('ID must be an integer')
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const username = req.params.username;
    connection.query(`SELECT * FROM user_details WHERE username = ${username}`, (err, results) => {
      if (err) {
        // หากมีข้อผิดพลาดในการ query
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        // ถ้าไม่พบข้อมูล
        return res.status(404).json({ error: 'Data not found' });
      }
      res.json(results[0]);
    });
  });

  // Create a user
  router.post('/', (req, res) => {
    const { name, email } = req.body;
    connection.query(`INSERT INTO users (name, email) VALUES ('${name}', '${email}')`, (err, results) => {
      if (err) {
        // หากมีข้อผิดพลาดในการ query
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.send(`User '${name}' created successfully`);
    });
  });

  // Update a user
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;
    connection.query(`UPDATE users SET name = '${name}', email = '${email}' WHERE user_id = ${id}`, (err, results) => {
      if (err) {
        // หากมีข้อผิดพลาดในการ query
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.send(`User with id '${id}' updated successfully`);
    });
  });

  // Delete a user
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    connection.query(`DELETE FROM user_details WHERE user_id = ${id}`, (err, results) => {
      if (err) {
        // หากมีข้อผิดพลาดในการ query
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.send(`User with id '${id}' deleted successfully`);
    });
  });

  return router;
};