// Thay vì export default
export interface IUser {
  userId: string;
  email: string;
  name?: string;
  password?: string;
  avatar?: string;
  xpPoints: number;
  level: number;
  createdAt: Date;
  role: "user" | "admin";
}