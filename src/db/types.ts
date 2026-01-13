export type Patient = {
  id: string;
  fullName: string;

  age?: number;
  room?: string;
  diagnosis?: string;
  precautions?: string; // free text

  dischargeDate?: string; // "YYYY-MM-DD" optional

  notes?: string;

  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};
