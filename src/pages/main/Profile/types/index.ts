export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  role: "User" | "Admin" | "Teacher";
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  age: string;
  address: string;
  gender: "Male" | "Female" | "Other";
}
