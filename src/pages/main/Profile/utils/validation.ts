export const validatePhone = (phone: string): string | null => {
  if (!phone) return null;

  const phoneRegex = /^[+]?[0-9]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return "Phone number must be 10-15 digits with optional + prefix";
  }
  return null;
};

export const validateAge = (age: string): string | null => {
  if (!age) return null;

  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum)) {
    return "Age must be a number";
  }
  if (ageNum < 1 || ageNum > 150) {
    return "Age must be between 1 and 150";
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return "Username is required";
  }
  if (username.length < 3 || username.length > 50) {
    return "Username must be between 3 and 50 characters";
  }
  return null;
};

export const validateFirstName = (firstName: string): string | null => {
  if (firstName && firstName.length > 100) {
    return "First name must be at most 100 characters";
  }
  return null;
};

export const validateLastName = (lastName: string): string | null => {
  if (lastName && lastName.length > 100) {
    return "Last name must be at most 100 characters";
  }
  return null;
};
