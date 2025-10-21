const express = require('express');
const { analyzeAndSaveCrack, getCracksByUser, deleteCrack } = require('../controllers/crackController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyse', protect, analyzeAndSaveCrack);
router.get('/my-cracks', protect, getCracksByUser);
router.delete('/:id',protect, deleteCrack);

module.exports = router;
