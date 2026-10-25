export interface LoginData{
    email:string
    password:string
}
export interface LoginResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  redirectTo:string
}