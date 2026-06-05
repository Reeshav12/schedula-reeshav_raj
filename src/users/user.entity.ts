export enum Role {
    DOCTOR = 'DOCTOR',
    PATIENT = 'PATIENT',
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
  }