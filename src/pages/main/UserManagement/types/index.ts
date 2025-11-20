export interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  age?: number;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  role: "User" | "Admin" | "Teacher";
}

export interface CreateUserFormData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  age: string;
  address: string;
  gender: "Male" | "Female" | "Other";
  role: "User" | "Admin" | "Teacher";
}

export interface EditUserFormData {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  age: string;
  address: string;
  gender: "Male" | "Female" | "Other";
}
