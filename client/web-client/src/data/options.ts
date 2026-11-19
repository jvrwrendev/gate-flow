import type { VehicleColor, VehicleType } from '@/types'
export const vehicleTypes: VehicleType[] = ['Sedan','SUV','Pickup','Van','Motorcycle','Tricycle','Bus','Truck']
export const vehicleColors: VehicleColor[] = ['White','Black','Silver','Gray','Red','Blue','Green','Brown','Other']
export const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
export const vehicleTypeOptions = vehicleTypes.map(v => ({ value: v, label: v }))
export const vehicleColorOptions = vehicleColors.map(v => ({ value: v, label: v }))
