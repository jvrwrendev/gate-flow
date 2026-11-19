import { z } from 'zod';

const VEHICLE_TYPE_OPTIONS = [
  'Car',
  'Motorcycle',
  'SUV',
  'Truck',
  'Van',
  'Other',
] as const;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(4, 'Password must be at least 4 characters.'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    phone: z.string().min(7, 'Please enter a valid phone number.'),
    unit: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const vehicleSchema = z.object({
  plateNumber: z.string().min(3, 'Plate number is required.'),
  type: z.enum(VEHICLE_TYPE_OPTIONS),
  brand: z.string().min(1, 'Brand is required.'),
  model: z.string().min(1, 'Model is required.'),
  color: z.string().min(1, 'Color is required.'),
  photoUrl: z.string().optional(),
});

export type VehicleSchema = z.infer<typeof vehicleSchema>;

export const visitorPassSchema = z
  .object({
    visitorName: z.string().min(2, 'Visitor name is required.'),
    visitorPhone: z.string().optional(),
    purpose: z.string().min(3, 'Purpose is required.'),
    vehiclePlate: z.string().optional(),
    vehicleType: z.enum(VEHICLE_TYPE_OPTIONS).optional(),
    scheduledStart: z.string().min(1, 'Start date/time is required.'),
    scheduledEnd: z.string().min(1, 'End date/time is required.'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.scheduledStart);
      const end = new Date(data.scheduledEnd);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: 'End time must be after start time.',
      path: ['scheduledEnd'],
    }
  );

export type VisitorPassSchema = z.infer<typeof visitorPassSchema>;
