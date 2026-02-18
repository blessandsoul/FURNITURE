export type UserRole = 'USER' | 'ADMIN';

export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
}
