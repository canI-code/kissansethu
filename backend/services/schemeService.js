import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemesData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'schemes.json'), 'utf-8'));

// Rule-based scheme eligibility matching (fast, no AI needed)
export function checkEligibility(farmerProfile) {
  const results = {
    eligible: [],
    almostEligible: [],
    notEligible: []
  };

  for (const scheme of schemesData) {
    const { score, gaps } = evaluateScheme(farmerProfile, scheme);

    const entry = {
      id: scheme.id,
      name: scheme.name,
      nameHi: scheme.nameHi,
      description: scheme.description,
      descriptionHi: scheme.descriptionHi,
      benefits: scheme.benefits,
      category: scheme.category,
      score,
      gaps,
      documentsRequired: scheme.documentsRequired,
      applicationLink: scheme.applicationLink
    };

    if (score >= 100) {
      results.eligible.push(entry);
    } else if (score >= 60) {
      results.almostEligible.push(entry);
    } else {
      results.notEligible.push(entry);
    }
  }

  // Sort by score descending
  results.eligible.sort((a, b) => b.score - a.score);
  results.almostEligible.sort((a, b) => b.score - a.score);

  return results;
}

function evaluateScheme(profile, scheme) {
  const criteria = scheme.eligibility;
  let totalCriteria = 0;
  let metCriteria = 0;
  const gaps = [];

  // Land requirement
  if (criteria.landRequired !== undefined) {
    totalCriteria++;
    if (criteria.landRequired && profile.landAcres > 0) {
      metCriteria++;
    } else if (!criteria.landRequired) {
      metCriteria++; // Land not required, auto-pass
    } else {
      gaps.push({ field: 'land', messageHi: 'जमीन का रिकॉर्ड चाहिए', messageEn: 'Land records required' });
    }
  }

  // Min land
  if (criteria.minLandAcres !== undefined) {
    totalCriteria++;
    if (profile.landAcres >= criteria.minLandAcres) {
      metCriteria++;
    } else {
      gaps.push({ field: 'minLand', messageHi: `कम से कम ${criteria.minLandAcres} एकड़ जमीन चाहिए`, messageEn: `Minimum ${criteria.minLandAcres} acres land required` });
    }
  }

  // Max land
  if (criteria.maxLandAcres !== undefined) {
    totalCriteria++;
    if (profile.landAcres <= criteria.maxLandAcres) {
      metCriteria++;
    } else {
      gaps.push({ field: 'maxLand', messageHi: `जमीन ${criteria.maxLandAcres} एकड़ से ज्यादा नहीं होनी चाहिए`, messageEn: `Land must not exceed ${criteria.maxLandAcres} acres` });
    }
  }

  // Age
  if (criteria.ageMin !== undefined) {
    totalCriteria++;
    if (profile.age >= criteria.ageMin) {
      metCriteria++;
    } else {
      gaps.push({ field: 'ageMin', messageHi: `उम्र कम से कम ${criteria.ageMin} साल होनी चाहिए`, messageEn: `Age must be at least ${criteria.ageMin}` });
    }
  }

  if (criteria.ageMax !== undefined) {
    totalCriteria++;
    if (profile.age <= criteria.ageMax) {
      metCriteria++;
    } else {
      gaps.push({ field: 'ageMax', messageHi: `उम्र ${criteria.ageMax} साल से ज्यादा नहीं होनी चाहिए`, messageEn: `Age must not exceed ${criteria.ageMax}` });
    }
  }

  // Aadhaar
  if (criteria.aadhaarRequired) {
    totalCriteria++;
    if (profile.hasAadhaar) {
      metCriteria++;
    } else {
      gaps.push({ field: 'aadhaar', messageHi: 'आधार कार्ड बनवाएं', messageEn: 'Get Aadhaar card' });
    }
  }

  // Bank account
  if (criteria.bankAccountRequired) {
    totalCriteria++;
    if (profile.hasBankAccount) {
      metCriteria++;
    } else {
      gaps.push({ field: 'bankAccount', messageHi: 'बैंक खाता खुलवाएं', messageEn: 'Open a bank account' });
    }
  }

  // State restriction
  if (criteria.states && criteria.states.length > 0) {
    totalCriteria++;
    if (criteria.states.some(s => s.toLowerCase() === (profile.state || '').toLowerCase())) {
      metCriteria++;
    } else {
      gaps.push({ field: 'state', messageHi: `यह योजना सिर्फ ${criteria.states.join(', ')} के लिए है`, messageEn: `This scheme is only for ${criteria.states.join(', ')}` });
    }
  }

  // Farmer type
  if (criteria.farmerTypes && !criteria.farmerTypes.includes('all')) {
    totalCriteria++;
    if (criteria.farmerTypes.includes(profile.category)) {
      metCriteria++;
    } else {
      gaps.push({ field: 'farmerType', messageHi: `यह योजना ${criteria.farmerTypes.join('/')} किसानों के लिए है`, messageEn: `This scheme is for ${criteria.farmerTypes.join('/')} farmers` });
    }
  }

  // Exclusions
  if (criteria.excludeGovtEmployees) {
    totalCriteria++;
    if (!profile.isGovtEmployee) {
      metCriteria++;
    } else {
      gaps.push({ field: 'govtEmployee', messageHi: 'सरकारी कर्मचारी पात्र नहीं', messageEn: 'Government employees not eligible' });
    }
  }

  if (criteria.excludeTaxPayers) {
    totalCriteria++;
    if (!profile.isTaxPayer) {
      metCriteria++;
    } else {
      gaps.push({ field: 'taxPayer', messageHi: 'आयकर देने वाले पात्र नहीं', messageEn: 'Income tax payers not eligible' });
    }
  }

  // Livestock
  if (criteria.hasLivestock) {
    totalCriteria++;
    if (profile.hasLivestock) {
      metCriteria++;
    } else {
      gaps.push({ field: 'livestock', messageHi: 'पशु होने चाहिए', messageEn: 'Livestock required' });
    }
  }

  const score = totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;
  return { score, gaps };
}

export function getAllSchemes() {
  return schemesData;
}

export function getSchemeById(id) {
  return schemesData.find(s => s.id === id);
}
