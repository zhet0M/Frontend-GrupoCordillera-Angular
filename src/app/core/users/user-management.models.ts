import { UserRole, UserStatus } from '../auth/auth.models';

export interface ManagedUser {
  id: number;
  username: string;
  email: string;
  rol: UserRole | null;
  estado: UserStatus;
}

export interface ApproveUserRequest {
  rol: UserRole;
}
