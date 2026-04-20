/**
 * User document schema for MongoDB users collection.
 *
 * MongoDB is schemaless, so this file serves two purposes:
 *  1. Documents the canonical shape of a user document.
 *  2. Exports a factory function `createUserDocument()` used when inserting
 *     new users so every document is created with the correct fields.
 */

/**
 * Creates a new user document with all required fields initialised.
 *
 * @param {string} phone - Digits-only phone number (e.g. "919876543210")
 * @returns {object} A user document ready to be inserted into MongoDB
 */
export const createUserDocument = (phone) => ({
  // Core identity
  phone,                    // String — digits only, used as unique key
  isVerified: false,        // Boolean — true after OTP verification

  // Role system (Requirement 2)
  roles: [],                // Array<'farmer'|'worker'|'equipment_owner'>
  activeRole: null,         // String|null — currently active role

  // Role-specific profiles (populated lazily as user fills them in)
  farmerProfile: null,      // Object|null — see farmerProfileShape below
  workerProfile: null,      // Object|null — see workerProfileShape below
  equipmentProfile: null,   // Object|null — see equipmentProfileShape below

  // Metadata
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null,

  // Moderation
  reportCount: 0,
  suspendedUntil: null,
  isDeleted: false,
  deletionRequestedAt: null,
});

/**
 * Shape reference for farmerProfile sub-document.
 * All fields are optional — filled in progressively.
 */
export const farmerProfileShape = {
  name: '',
  age: null,
  gender: '',           // 'male' | 'female' | 'other'
  location: {
    village: '',
    district: '',
    state: '',
    pincode: '',
  },
  landAcres: null,
  crops: [],            // e.g. ['wheat', 'rice']
  annualIncome: null,
  hasAadhaar: false,
  hasBankAccount: false,
  profilePicUrl: '',
  bio: '',
};

/**
 * Shape reference for workerProfile sub-document.
 */
export const workerProfileShape = {
  name: '',
  skills: [],           // e.g. ['ploughing', 'sowing', 'tractor_operation']
  dailyRate: null,      // Number — INR per day
  experience: null,     // Number — years
  available: true,      // Boolean — availability toggle
  location: {
    village: '',
    district: '',
    state: '',
  },
  profilePicUrl: '',
  bio: '',
  rating: 0,
  totalJobs: 0,
};

/**
 * Shape reference for equipmentProfile sub-document.
 */
export const equipmentProfileShape = {
  name: '',
  businessName: '',
  location: {
    village: '',
    district: '',
    state: '',
  },
  profilePicUrl: '',
  totalListings: 0,
  rating: 0,
};
