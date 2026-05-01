import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  birth_date?: Date;
  gender?: 'M' | 'F' | 'O';
  city?: string;
  district?: string;
  country?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  birth_date?: Date;
  gender?: 'M' | 'F' | 'O';
  city?: string;
}

export interface UpdateUserDTO {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  district?: string;
}

export const createUserObject = (data: Partial<User>): User => {
  return {
    id: data.id || uuidv4(),
    username: data.username || '',
    email: data.email || '',
    password_hash: data.password_hash || '',
    created_at: data.created_at || new Date(),
    updated_at: data.updated_at || new Date(),
    full_name: data.full_name,
    phone: data.phone,
    avatar_url: data.avatar_url,
    birth_date: data.birth_date,
    gender: data.gender,
    city: data.city,
    district: data.district,
    country: data.country,
    bio: data.bio,
  };
};
