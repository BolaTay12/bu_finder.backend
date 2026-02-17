export interface CreateUserData {
  fullName: string;
  email: string;
  universityId: string;
  password: string;
}

export interface UserResult {
  id: string;
  fullName: string;
  email: string;
  universityId: string;
  role: string;
  createdAt: Date;
}

export interface UserWithPassword extends UserResult {
  password: string;
}

export interface IAuthRepository {
    findByEmail(email: string): Promise<UserWithPassword | null>;
    findByUniversityId(universityId: string): Promise<UserResult | null>;
    findById(userId: string): Promise<UserResult | null>;
    create(data: CreateUserData): Promise<UserResult>;
}

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');