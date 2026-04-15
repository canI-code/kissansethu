import { Router } from 'express';
import { checkEligibility, getAllSchemes, getSchemeById } from '../services/schemeService.js';

const router = Router();

// Get all schemes
router.get('/', (req, res) => {
  const { category } = req.query;
  let schemes = getAllSchemes();
  if (category) {
    schemes = schemes.filter(s => s.category === category);
  }
  res.json(schemes);
});

// Get single scheme
router.get('/:id', (req, res) => {
  const scheme = getSchemeById(req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json(scheme);
});

// Check eligibility for a farmer profile
router.post('/eligibility', (req, res) => {
  try {
    const farmerProfile = req.body;
    const results = checkEligibility(farmerProfile);
    res.json({
      summary: {
        eligible: results.eligible.length,
        almostEligible: results.almostEligible.length,
        totalChecked: getAllSchemes().length
      },
      ...results
    });
  } catch (error) {
    res.status(500).json({ error: 'Eligibility check failed', details: error.message });
  }
});

export default router;
