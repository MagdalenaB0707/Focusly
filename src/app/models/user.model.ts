export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}
export type UserDTO = Omit<User, 'id'>;
