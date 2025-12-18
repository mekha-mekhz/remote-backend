// routes/productivityRoutes.js
const express = require('express');
const router = express.Router();
const ProductivityController=require('../controllers/productivitycontroller');
const auth= require('../middleware/auth'); // your auth middleware

// Get user's productivity reports
router.get('/my', auth.authuser, ProductivityController. getMyReports);

// Add a new productivity entry
router.post('/', auth.authuser, ProductivityController.addProductivity);

// Update an existing productivity entry
router.put('/:id', auth.authuser, ProductivityController.updateProgress);
router.get('/weekly', auth.authuser, ProductivityController.getWeeklyReport);
router.get('/monthly', auth.authuser, ProductivityController.getMonthlyReport);
module.exports = router;
