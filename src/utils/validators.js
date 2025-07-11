// src/utils/validators.js

export const passwordRulesConfig = {
  length: {
    fn: (pwd) => pwd.length >= 8,
    label: 'Password must be at least 8 characters', // More specific label
  },
  digit: {
    fn: (pwd) => /\d/.test(pwd),
    label: 'Password must contain at least 1 digit',
  },
  capital: {
    fn: (pwd) => /[A-Z]/.test(pwd),
    label: 'Password must contain at least 1 capital letter',
  },
  special: {
    fn: (pwd) => /[^A-Za-z0-9]/.test(pwd),
    label: 'Password must contain at least 1 special character',
  },
};


// Validates the structure of a password based on predefined rules.
export const validatePasswordStructure = (password) => {
  const validation = {};
  for (const rule in passwordRulesConfig) {
    validation[rule] = passwordRulesConfig[rule].fn(password);
  }
  return validation;
};


// Checks if two passwords match.
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};


// Checks if all password validation rules (structure and match) are met.
export const areAllPasswordRequirementsMet = (structureValidationStatus, passwordsMatchStatus) => {
  const allStructureRulesMet = Object.values(structureValidationStatus).every(Boolean);
  return allStructureRulesMet && passwordsMatchStatus;
};
