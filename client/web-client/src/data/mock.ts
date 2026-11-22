import type { AppData, AIModel, RecognitionLog, Vehicle, VehicleType, VehicleColor, VisitorApplication } from '@/types'

const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString()
const day = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

export const vehicles: Vehicle[] = [
  { id: 'VH-001', plate: 'NBC 1234', ownerId: 'OW-001', ownerName: 'Maria Santos', contact: '+63 917 245 8812', type: 'SUV', model: 'Toyota Fortuner', color: 'White', registrationDate: '2025-11-18', status: 'Authorized' },
  { id: 'VH-002', plate: 'ABC 1456', ownerId: 'OW-002', ownerName: 'Jose Ramirez', contact: '+63 918 532 1904', type: 'Sedan', model: 'Honda Civic', color: 'Black', registrationDate: '2025-10-06', status: 'Authorized' },
  { id: 'VH-003', plate: 'NCA 8072', ownerId: 'OW-003', ownerName: 'Angelica Cruz', contact: '+63 905 612 4451', type: 'Van', model: 'Toyota Hiace', color: 'Silver', registrationDate: '2026-01-24', status: 'Authorized' },
  { id: 'VH-004', plate: 'DAH 5521', ownerId: 'OW-004', ownerName: 'Roberto Dela Peña', contact: '+63 926 711 0832', type: 'Pickup', model: 'Ford Ranger', color: 'Blue', registrationDate: '2026-02-12', status: 'Authorized' },
  { id: 'VH-005', plate: '7412 ME', ownerId: 'OW-005', ownerName: 'Liza Mendoza', contact: '+63 977 301 4320', type: 'Motorcycle', model: 'Yamaha NMAX', color: 'Red', registrationDate: '2026-03-03', status: 'Suspended' },
  { id: 'VH-006', plate: 'GAV 2190', ownerId: 'OW-006', ownerName: 'Paolo Villanueva', contact: '+63 945 622 7431', type: 'SUV', model: 'Mitsubishi Montero Sport', color: 'Gray', registrationDate: '2025-08-29', status: 'Authorized' },
  { id: 'VH-007', plate: 'TXI 4408', ownerId: 'OW-007', ownerName: 'Cebu Prime Transport', contact: '+63 32 412 8060', type: 'Bus', model: 'Hino Grandeza', color: 'White', registrationDate: '2025-12-14', status: 'Authorized' },
  { id: 'VH-008', plate: 'KLM 9063', ownerId: 'OW-008', ownerName: 'Northline Logistics', contact: '+63 2 8721 4403', type: 'Truck', model: 'Isuzu Forward', color: 'Blue', registrationDate: '2026-01-07', status: 'Authorized' },
  { id: 'VH-009', plate: 'NEB 3478', ownerId: 'OW-009', ownerName: 'Katrina Lim', contact: '+63 917 330 1801', type: 'Sedan', model: 'Toyota Vios', color: 'Silver', registrationDate: '2026-02-25', status: 'Pending' },
  { id: 'VH-010', plate: 'TCR 1284', ownerId: 'OW-010', ownerName: 'San Pedro Tricycle Coop', contact: '+63 949 801 3329', type: 'Tricycle', model: 'Honda TMX 125', color: 'Green', registrationDate: '2025-07-15', status: 'Authorized' },
  { id: 'VH-011', plate: 'CAR 6819', ownerId: 'OW-011', ownerName: 'Miguel Torres', contact: '+63 906 441 2750', type: 'Pickup', model: 'Nissan Navara', color: 'Black', registrationDate: '2025-09-08', status: 'Authorized' },
  { id: 'VH-012', plate: 'QWE 7742', ownerId: 'OW-012', ownerName: 'Elena Bautista', contact: '+63 998 304 5668', type: 'Van', model: 'Nissan Urvan', color: 'White', registrationDate: '2026-04-11', status: 'Denied' },
]

const extraVehicles: Vehicle[] = Array.from({ length: 174 }, (_, i) => {
  const base = vehicles[i % vehicles.length]
  return { ...base, id: `VH-${String(i + 13).padStart(3, '0')}`, plate: `${['NCR','CAL','CAV','LAG','BUL','RIZ'][i % 6]} ${String(2000 + i)}`, status: i % 19 === 0 ? 'Suspended' : 'Authorized' }
})
const allVehicles = [...vehicles, ...extraVehicles]

const names = ['Maria Santos', 'Jose Ramirez', 'Angelica Cruz', 'Roberto Dela Peña', 'Liza Mendoza', 'Paolo Villanueva', 'Cebu Prime Transport', 'Northline Logistics', 'Katrina Lim', 'San Pedro Tricycle Coop', 'Miguel Torres', 'Elena Bautista']
const owners = names.map((name, i) => ({ id: `OW-${String(i + 1).padStart(3, '0')}`, name, email: i > 5 ? `operations${i}@business.ph` : `${name.toLowerCase().replace(' ', '.')}@email.ph`, phone: vehicles[i].contact, address: ['Makati City, Metro Manila', 'Quezon City, Metro Manila', 'Taguig City, Metro Manila', 'Cebu City, Cebu'][i % 4], joined: vehicles[i].registrationDate, status: 'Active' as const }))

const gates = [
  { id: 'GT-01', name: 'Main Entrance', location: 'North Wing · Visitor & Resident Entry', cameraId: 'CAM-01', controllerId: 'ESP32-G01', status: 'Online' as const, barrier: 'CLOSED' as const, mode: 'AUTOMATIC' as const, entriesToday: 428, lastActivity: ago(.08) },
  { id: 'GT-02', name: 'Main Exit', location: 'North Wing · All Vehicle Exit', cameraId: 'CAM-02', controllerId: 'ESP32-G02', status: 'Online' as const, barrier: 'CLOSED' as const, mode: 'AUTOMATIC' as const, entriesToday: 391, lastActivity: ago(.16) },
  { id: 'GT-03', name: 'Staff Parking', location: 'East Wing · Employees Only', cameraId: 'CAM-03', controllerId: 'ESP32-G03', status: 'Online' as const, barrier: 'OPEN' as const, mode: 'MANUAL' as const, entriesToday: 146, lastActivity: ago(.35) },
  { id: 'GT-04', name: 'Service Gate', location: 'South Wing · Deliveries & Contractors', cameraId: 'CAM-04', controllerId: 'ESP32-G04', status: 'Offline' as const, barrier: 'CLOSED' as const, mode: 'MANUAL' as const, entriesToday: 57, lastActivity: ago(5.2) },
]
const cameras = [
  { id: 'CAM-01', name: 'Entrance LPR Camera', location: 'Main Entrance · Pole A', model: 'TP-Link Tapo C320WS', type: 'Bullet' as const, status: 'Online' as const, gateId: 'GT-01', protocol: 'RTSP' as const, lastConnection: ago(0), ipAddress: '192.168.10.41' },
  { id: 'CAM-02', name: 'Exit LPR Camera', location: 'Main Exit · Pole B', model: 'TP-Link Tapo C320WS', type: 'Bullet' as const, status: 'Online' as const, gateId: 'GT-02', protocol: 'RTSP' as const, lastConnection: ago(0), ipAddress: '192.168.10.42' },
  { id: 'CAM-03', name: 'Staff Parking Overview', location: 'East Wing · Pole C', model: 'TP-Link Tapo C520WS', type: 'PTZ' as const, status: 'Online' as const, gateId: 'GT-03', protocol: 'ONVIF' as const, lastConnection: ago(.02), ipAddress: '192.168.10.43' },
  { id: 'CAM-04', name: 'Service Gate Camera', location: 'South Wing · Wall Mount', model: 'Generic ONVIF IP Camera', type: 'Dome' as const, status: 'Offline' as const, gateId: 'GT-04', protocol: 'ONVIF' as const, lastConnection: ago(5.2), ipAddress: '192.168.10.44' },
]
const types: VehicleType[] = ['Sedan', 'SUV', 'Pickup', 'Van', 'Motorcycle', 'Tricycle', 'Bus', 'Truck']
const colors: VehicleColor[] = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown']
const recognitionLogs: RecognitionLog[] = Array.from({ length: 68 }, (_, i) => {
  const v = allVehicles[(i * 7) % allVehicles.length]
  const denied = i % 11 === 0
  const review = !denied && i % 13 === 0
  return { id: `REC-${String(9182 - i)}`, timestamp: ago(i * .37), plate: denied ? ['XYZ 8891', 'UNKNOWN', 'NAA 0912'][i % 3] : v.plate, type: types[i % types.length], color: colors[i % colors.length], confidence: denied ? 68 + (i % 12) : 88 + (i % 12) * .8, cameraId: `CAM-0${i % 4 + 1}`, gateId: `GT-0${i % 4 + 1}`, decision: denied ? 'DENIED' : review ? 'NEEDS REVIEW' : 'AUTHORIZED', reason: denied ? 'Plate is not registered in the vehicle directory' : review ? 'Confidence below automatic approval threshold' : 'Active vehicle registration and access rule verified' }
})
const models: AIModel[] = [
  { id: 'MDL-01', category: 'Vehicle Detection', name: 'YOLOv8 Vehicle Detector', version: 'v8.2.1', status: 'Active', accuracy: 96.8, lastUpdated: '2026-10-28', size: '52.4 MB', description: 'Detects and localizes vehicles in configured camera frames.', metricLabel: 'mAP@50' },
  { id: 'MDL-02', category: 'License Plate Recognition', name: 'LPR Detector + PaddleOCR', version: 'v3.4.0', status: 'Active', accuracy: 94.2, lastUpdated: '2026-10-19', size: '86.1 MB', description: 'Two-stage plate localization and optical character recognition pipeline.', metricLabel: 'Plate accuracy' },
  { id: 'MDL-03', category: 'Vehicle Classification', name: 'EfficientNet Classifier', version: 'v2.1.3', status: 'Active', accuracy: 92.7, lastUpdated: '2026-09-30', size: '41.8 MB', description: 'Classifies Sedan, SUV, Pickup, Van, Motorcycle, Tricycle, Bus, and Truck.', metricLabel: 'Top-1 accuracy' },
  { id: 'MDL-04', category: 'Vehicle Color Recognition', name: 'ColorNet Classifier', version: 'v1.8.2', status: 'Active', accuracy: 89.5, lastUpdated: '2026-08-14', size: '24.6 MB', description: 'Recognizes White, Black, Silver, Gray, Red, Blue, Green, Brown, and Other.', metricLabel: 'Validation accuracy' },
  { id: 'MDL-05', category: 'Vehicle Detection', name: 'YOLOv5 Detector (Legacy)', version: 'v5.7.0', status: 'Inactive', accuracy: 91.3, lastUpdated: '2025-12-02', size: '46.2 MB', description: 'Previous vehicle detector retained for comparison.', metricLabel: 'mAP@50' },
]
const incidents = [
  { id: 'INC-2041', type: 'Camera disconnection', severity: 'High' as const, timestamp: ago(5.2), gateId: 'GT-04', description: 'Service Gate Camera stopped responding. Last heartbeat was received 5 hours ago.', status: 'Investigating' as const, remarks: 'Facilities team notified for power and network inspection.' },
  { id: 'INC-2040', type: 'Unauthorized vehicle attempt', severity: 'Critical' as const, timestamp: ago(1.15), gateId: 'GT-01', description: 'Unregistered plate XYZ 8891 attempted entry three consecutive times.', status: 'Open' as const, remarks: '' },
  { id: 'INC-2039', type: 'Manual barrier opening', severity: 'Medium' as const, timestamp: ago(2.4), gateId: 'GT-03', description: 'Barrier opened manually by Gate Operator during scheduled maintenance.', status: 'Resolved' as const, remarks: 'Verified with maintenance work order MW-2208.' },
  { id: 'INC-2038', type: 'Repeated recognition failure', severity: 'Medium' as const, timestamp: ago(3.8), gateId: 'GT-02', description: 'License plate OCR failed for five recognition attempts.', status: 'Open' as const, remarks: '' },
  { id: 'INC-2037', type: 'Obstruction detected', severity: 'High' as const, timestamp: ago(26), gateId: 'GT-01', description: 'Barrier close operation interrupted by an obstruction.', status: 'Resolved' as const, remarks: 'Obstruction cleared. Normal operation restored.' },
  { id: 'INC-2036', type: 'Failed barrier operation', severity: 'High' as const, timestamp: ago(49), gateId: 'GT-04', description: 'Controller did not acknowledge the close command.', status: 'Resolved' as const, remarks: 'Controller restarted and limit switch tested.' },
]
const applications = [
  { id: 'APP-1082', reference: 'VA-2026-1082', ownerId: 'OW-009', ownerName: 'Katrina Lim', email: 'katrina.lim@email.ph', phone: '+63 917 330 1801', plate: 'NEB 3478', type: 'Sedan' as const, model: 'Toyota Vios 2024', color: 'Silver' as const, submitted: ago(2), status: 'Pending' as const, remarks: '', purpose: 'Resident vehicle registration' },
  { id: 'APP-1081', reference: 'VA-2026-1081', ownerId: 'OW-001', ownerName: 'Maria Santos', email: 'maria.santos@email.ph', phone: '+63 917 245 8812', plate: 'NBC 7821', type: 'SUV' as const, model: 'Honda BR-V 2025', color: 'White' as const, submitted: ago(7), status: 'Pending' as const, remarks: '', purpose: 'Additional household vehicle' },
  { id: 'APP-1080', reference: 'VA-2026-1080', ownerId: 'OW-005', ownerName: 'Liza Mendoza', email: 'liza.mendoza@email.ph', phone: '+63 977 301 4320', plate: '9821 MK', type: 'Motorcycle' as const, model: 'Honda Click 160', color: 'Blue' as const, submitted: ago(25), status: 'Approved' as const, remarks: 'Documents verified.', purpose: 'Employee parking access' },
  { id: 'APP-1079', reference: 'VA-2026-1079', ownerId: 'OW-012', ownerName: 'Elena Bautista', email: 'elena.bautista@email.ph', phone: '+63 998 304 5668', plate: 'QWE 7742', type: 'Van' as const, model: 'Nissan Urvan', color: 'White' as const, submitted: ago(30), status: 'Rejected' as const, remarks: 'Plate on OR/CR does not match the submitted plate.', purpose: 'Delivery vehicle access' },
  { id: 'APP-1078', reference: 'VA-2026-1078', ownerId: 'OW-004', ownerName: 'Roberto Dela Peña', email: 'roberto.dela peña@email.ph', phone: '+63 926 711 0832', plate: 'DAH 1198', type: 'Pickup' as const, model: 'Toyota Hilux', color: 'Gray' as const, submitted: ago(52), status: 'Approved' as const, remarks: 'Approved for staff parking.', purpose: 'Employee parking access' },
]
const admins = [
  { id: 'ADM-01', name: 'Adrian Velasco', email: 'adrian.velasco@gatevision.ph', contactNumber: '+63 917 100 2001', password: 'AdminPass123!', role: 'Super Admin' as const, status: 'Active' as const, lastLogin: ago(.5), createdAt: '2025-01-10T08:00:00.000Z' },
  { id: 'ADM-02', name: 'Sophia Reyes', email: 'sophia.reyes@gatevision.ph', contactNumber: '+63 917 100 2002', password: 'AdminPass123!', role: 'System Admin' as const, status: 'Active' as const, lastLogin: ago(3.1), createdAt: '2025-03-14T09:15:00.000Z' },
  { id: 'ADM-03', name: 'Daniel Navarro', email: 'daniel.navarro@gatevision.ph', contactNumber: '+63 917 100 2003', password: 'AdminPass123!', role: 'Security Personnel' as const, status: 'Active' as const, lastLogin: ago(1.2), createdAt: '2025-06-02T07:30:00.000Z' },
  { id: 'ADM-04', name: 'Grace Flores', email: 'grace.flores@gatevision.ph', contactNumber: '+63 917 100 2004', password: 'AdminPass123!', role: 'Gate Operator' as const, status: 'Active' as const, lastLogin: ago(7.4), createdAt: '2025-07-20T10:45:00.000Z' },
  { id: 'ADM-05', name: 'Marco Aquino', email: 'marco.aquino@gatevision.ph', contactNumber: '+63 917 100 2005', password: 'AdminPass123!', role: 'Viewer' as const, status: 'Inactive' as const, lastLogin: ago(480), createdAt: '2025-09-05T11:00:00.000Z' },
]
const auditLogs = [
  { id: 'AUD-8018', timestamp: ago(.2), admin: 'Adrian Velasco', actorId: 'ADM-01', actorRole: 'Super Admin' as const, action: 'Updated vehicle', module: 'Registered Vehicles', details: 'Updated authorization status for NBC 1234', ipAddress: '192.168.10.18', result: 'Success' as const },
  { id: 'AUD-8017', timestamp: ago(1.1), admin: 'Daniel Navarro', actorId: 'ADM-03', actorRole: 'Security Personnel' as const, action: 'Acknowledged incident', module: 'Security Incidents', details: 'Changed INC-2040 to Investigating', ipAddress: '192.168.10.32', result: 'Success' as const },
  { id: 'AUD-8016', timestamp: ago(2.3), admin: 'Grace Flores', actorId: 'ADM-04', actorRole: 'Gate Operator' as const, action: 'Manual barrier open', module: 'Barrier Gates', details: 'Opened Main Entrance · simulated control', ipAddress: '192.168.10.45', result: 'Success' as const },
  { id: 'AUD-8015', timestamp: ago(4.2), admin: 'Sophia Reyes', actorId: 'ADM-02', actorRole: 'System Admin' as const, action: 'Updated configuration', module: 'AI Configuration', details: 'Set recognition threshold to 85%', ipAddress: '192.168.10.21', result: 'Success' as const },
  { id: 'AUD-8014', timestamp: ago(7.8), admin: 'Adrian Velasco', actorId: 'ADM-01', actorRole: 'Super Admin' as const, action: 'Approved application', module: 'Vehicle Applications', details: 'Approved VA-2026-1080', ipAddress: '192.168.10.18', result: 'Success' as const },
]

const visitorApplications: VisitorApplication[] = [
  {
    id: 'VAP-1006', reference: 'VIS-2026-1006', visitorName: 'Carlo Mendoza', visitorEmail: 'carlo.mendoza@email.ph', visitorPhone: '+63 917 555 2101',
    requestedById: 'OW-001', requestedByName: 'Maria Santos', requestedByEmail: 'maria.santos@email.ph',
    vehiclePlate: 'NCR 8821', vehicleType: 'Sedan', vehicleModel: 'Toyota Vios', vehicleColor: 'Silver',
    purpose: 'Family visit and overnight stay', visitStart: ago(-2), visitEnd: ago(-26), submittedAt: ago(5),
    status: 'Pending', remarks: '', gateAccess: 'QR + Plate',
    timeline: [
      { id: 'VAT-1006-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(5), actor: 'Maria Santos' },
    ],
  },
  {
    id: 'VAP-1005', reference: 'VIS-2026-1005', visitorName: 'Jasmine Uy', visitorEmail: 'jasmine.uy@email.ph', visitorPhone: '+63 928 444 9012',
    requestedById: 'OW-002', requestedByName: 'Jose Ramirez', requestedByEmail: 'jose.ramirez@email.ph',
    vehiclePlate: 'CAL 3310', vehicleType: 'SUV', vehicleModel: 'Honda CR-V', vehicleColor: 'White',
    purpose: 'Supplier meeting at Unit B-12', visitStart: ago(-1), visitEnd: ago(-5), submittedAt: ago(8), reviewedAt: ago(3),
    status: 'Under Review', remarks: 'Verifying visit schedule with security desk.', gateAccess: 'QR + Plate',
    timeline: [
      { id: 'VAT-1005-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(8), actor: 'Jose Ramirez' },
      { id: 'VAT-1005-2', status: 'Under Review', label: 'Marked under review', description: 'Security admin started reviewing the request.', timestamp: ago(3), actor: 'Adrian Velasco' },
    ],
  },
  {
    id: 'VAP-1004', reference: 'VIS-2026-1004', passReference: 'VP-2026-8841', qrCodeValue: 'GATEGUARD-VP-2026-8841',
    visitorName: 'Ramon Dela Cruz', visitorEmail: 'ramon.delacruz@email.ph', visitorPhone: '+63 916 220 1145',
    requestedById: 'OW-003', requestedByName: 'Angelica Cruz', requestedByEmail: 'angelica.cruz@email.ph',
    vehiclePlate: 'NCA 5520', vehicleType: 'Van', vehicleModel: 'Toyota Innova', vehicleColor: 'Gray',
    purpose: 'Home maintenance service', visitStart: ago(1), visitEnd: ago(-6), submittedAt: ago(26), reviewedAt: ago(24), approvedAt: ago(24),
    status: 'Approved', remarks: 'Approved for scheduled service window.', gateAccess: 'QR + Plate', currentlyInside: true, entryRecordedAt: ago(0.8),
    timeline: [
      { id: 'VAT-1004-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(26), actor: 'Angelica Cruz' },
      { id: 'VAT-1004-2', status: 'Approved', label: 'Application approved', description: 'Temporary visitor pass VP-2026-8841 generated.', timestamp: ago(24), actor: 'Adrian Velasco' },
    ],
  },
  {
    id: 'VAP-1003', reference: 'VIS-2026-1003',
    visitorName: 'Lina Bautista', visitorEmail: 'lina.bautista@email.ph', visitorPhone: '+63 905 771 3344',
    requestedById: 'OW-004', requestedByName: 'Roberto Dela Peña', requestedByEmail: 'roberto.dela peña@email.ph',
    vehiclePlate: 'CAV 9012', vehicleType: 'Motorcycle', vehicleModel: 'Honda Click', vehicleColor: 'Black',
    purpose: 'Unscheduled delivery', visitStart: ago(30), visitEnd: ago(28), submittedAt: ago(32), reviewedAt: ago(31), rejectedAt: ago(31),
    status: 'Rejected', remarks: 'Rejected due to incomplete visit details.', rejectionReason: 'Purpose and visit schedule were not sufficiently documented.', gateAccess: 'QR',
    timeline: [
      { id: 'VAT-1003-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(32), actor: 'Roberto Dela Peña' },
      { id: 'VAT-1003-2', status: 'Rejected', label: 'Application rejected', description: 'Request rejected by system admin.', timestamp: ago(31), actor: 'Sophia Reyes' },
    ],
  },
  {
    id: 'VAP-1002', reference: 'VIS-2026-1002', passReference: 'VP-2026-8790', qrCodeValue: 'GATEGUARD-VP-2026-8790',
    visitorName: 'Patrick Lim', visitorEmail: 'patrick.lim@email.ph', visitorPhone: '+63 917 008 4412',
    requestedById: 'OW-006', requestedByName: 'Paolo Villanueva', requestedByEmail: 'paolo.villanueva@email.ph',
    vehiclePlate: 'RIZ 4451', vehicleType: 'Pickup', vehicleModel: 'Ford Ranger', vehicleColor: 'Blue',
    purpose: 'Equipment pickup', visitStart: ago(48), visitEnd: ago(44), submittedAt: ago(52), reviewedAt: ago(50), approvedAt: ago(50), completedAt: ago(44),
    status: 'Completed', remarks: 'Visit completed and vehicle exited.', gateAccess: 'QR + Plate', currentlyInside: false, entryRecordedAt: ago(47.5), exitRecordedAt: ago(44),
    timeline: [
      { id: 'VAT-1002-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(52), actor: 'Paolo Villanueva' },
      { id: 'VAT-1002-2', status: 'Approved', label: 'Application approved', description: 'Temporary visitor pass VP-2026-8790 generated.', timestamp: ago(50), actor: 'Adrian Velasco' },
      { id: 'VAT-1002-3', status: 'Completed', label: 'Visit completed', description: 'Visitor exit recorded and pass closed.', timestamp: ago(44), actor: 'System' },
    ],
  },
  {
    id: 'VAP-1001', reference: 'VIS-2026-1001', passReference: 'VP-2026-8702', qrCodeValue: 'GATEGUARD-VP-2026-8702',
    visitorName: 'Mia Gonzales', visitorEmail: 'mia.gonzales@email.ph', visitorPhone: '+63 999 110 2233',
    requestedById: 'OW-009', requestedByName: 'Katrina Lim', requestedByEmail: 'katrina.lim@email.ph',
    vehiclePlate: 'BUL 7788', vehicleType: 'Sedan', vehicleModel: 'Honda City', vehicleColor: 'Red',
    purpose: 'Weekend guest visit', visitStart: ago(96), visitEnd: ago(72), submittedAt: ago(100), reviewedAt: ago(98), approvedAt: ago(98), expiredAt: ago(72),
    status: 'Expired', remarks: 'Pass validity ended automatically.', gateAccess: 'QR', currentlyInside: false,
    timeline: [
      { id: 'VAT-1001-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(100), actor: 'Katrina Lim' },
      { id: 'VAT-1001-2', status: 'Approved', label: 'Application approved', description: 'Temporary visitor pass VP-2026-8702 generated.', timestamp: ago(98), actor: 'Sophia Reyes' },
      { id: 'VAT-1001-3', status: 'Expired', label: 'Pass expired', description: 'Authorized schedule ended; pass automatically expired.', timestamp: ago(72), actor: 'System' },
    ],
  },
  {
    id: 'VAP-1007', reference: 'VIS-2026-1007', visitorName: 'Daniel Co', visitorEmail: 'daniel.co@email.ph', visitorPhone: '+63 917 888 1200',
    requestedById: 'OW-005', requestedByName: 'Liza Mendoza', requestedByEmail: 'liza.mendoza@email.ph',
    vehiclePlate: 'NCR 3345', vehicleType: 'SUV', vehicleModel: 'Mazda CX-5', vehicleColor: 'Black',
    purpose: 'Client meeting and document drop-off', visitStart: ago(-4), visitEnd: ago(-8), submittedAt: ago(2),
    status: 'Pending', remarks: '', gateAccess: 'QR + Plate',
    timeline: [
      { id: 'VAT-1007-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(2), actor: 'Liza Mendoza' },
    ],
  },
  {
    id: 'VAP-1008', reference: 'VIS-2026-1008', passReference: 'VP-2026-8890', qrCodeValue: 'GATEGUARD-VP-2026-8890',
    visitorName: 'Erika Santos', visitorEmail: 'erika.santos@email.ph', visitorPhone: '+63 926 140 7788',
    requestedById: 'OW-001', requestedByName: 'Maria Santos', requestedByEmail: 'maria.santos@email.ph',
    vehiclePlate: 'TAX 2109', vehicleType: 'Sedan', vehicleModel: 'Toyota Corolla', vehicleColor: 'White',
    purpose: 'Family lunch visit', visitStart: ago(-20), visitEnd: ago(-24), submittedAt: ago(30), reviewedAt: ago(28), approvedAt: ago(28),
    status: 'Approved', remarks: 'Approved for scheduled daytime visit.', gateAccess: 'QR', currentlyInside: false,
    timeline: [
      { id: 'VAT-1008-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(30), actor: 'Maria Santos' },
      { id: 'VAT-1008-2', status: 'Approved', label: 'Application approved', description: 'Temporary visitor pass VP-2026-8890 generated.', timestamp: ago(28), actor: 'Sophia Reyes' },
    ],
  },
  {
    id: 'VAP-1009', reference: 'VIS-2026-1009', visitorName: 'Noel Fernandez', visitorEmail: 'noel.fernandez@email.ph', visitorPhone: '+63 945 300 6611',
    requestedById: 'OW-007', requestedByName: 'Cebu Prime Transport', requestedByEmail: 'operations7@business.ph',
    vehiclePlate: 'CBU 7741', vehicleType: 'Truck', vehicleModel: 'Isuzu Elf', vehicleColor: 'White',
    purpose: 'Scheduled warehouse delivery', visitStart: ago(-6), visitEnd: ago(-10), submittedAt: ago(12), reviewedAt: ago(6),
    status: 'Under Review', remarks: 'Awaiting confirmation of delivery window from gate operations.', gateAccess: 'Plate',
    timeline: [
      { id: 'VAT-1009-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(12), actor: 'Cebu Prime Transport' },
      { id: 'VAT-1009-2', status: 'Under Review', label: 'Marked under review', description: 'Operations team validating delivery schedule.', timestamp: ago(6), actor: 'Daniel Navarro' },
    ],
  },
  {
    id: 'VAP-1010', reference: 'VIS-2026-1010', passReference: 'VP-2026-8922', qrCodeValue: 'GATEGUARD-VP-2026-8922',
    visitorName: 'Hannah Reyes', visitorEmail: 'hannah.reyes@email.ph', visitorPhone: '+63 917 220 9010',
    requestedById: 'OW-010', requestedByName: 'San Pedro Tricycle Coop', requestedByEmail: 'operations10@business.ph',
    vehiclePlate: 'SPC 3012', vehicleType: 'Van', vehicleModel: 'Nissan NV350', vehicleColor: 'Gray',
    purpose: 'Community supplies drop-off', visitStart: ago(20), visitEnd: ago(16), submittedAt: ago(24), reviewedAt: ago(22), approvedAt: ago(22), completedAt: ago(16),
    status: 'Completed', remarks: 'Delivery completed and visitor exited.', gateAccess: 'QR + Plate', currentlyInside: false, entryRecordedAt: ago(19.5), exitRecordedAt: ago(16),
    timeline: [
      { id: 'VAT-1010-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(24), actor: 'San Pedro Tricycle Coop' },
      { id: 'VAT-1010-2', status: 'Approved', label: 'Application approved', description: 'Temporary visitor pass VP-2026-8922 generated.', timestamp: ago(22), actor: 'Adrian Velasco' },
      { id: 'VAT-1010-3', status: 'Completed', label: 'Visit completed', description: 'Visitor exit recorded and pass closed.', timestamp: ago(16), actor: 'System' },
    ],
  },
  {
    id: 'VAP-1011', reference: 'VIS-2026-1011',
    visitorName: 'Vincent Tan', visitorEmail: 'vincent.tan@email.ph', visitorPhone: '+63 998 441 7001',
    requestedById: 'OW-011', requestedByName: 'Miguel Torres', requestedByEmail: 'operations11@business.ph',
    vehiclePlate: 'MKT 6654', vehicleType: 'Pickup', vehicleModel: 'Toyota Hilux', vehicleColor: 'Red',
    purpose: 'Contractor site inspection', visitStart: ago(10), visitEnd: ago(6), submittedAt: ago(14), reviewedAt: ago(13), rejectedAt: ago(13),
    status: 'Rejected', remarks: 'Rejected: requested schedule overlaps with restricted maintenance window.', rejectionReason: 'Visit schedule conflicts with a restricted maintenance window.', gateAccess: 'QR + Plate',
    timeline: [
      { id: 'VAT-1011-1', status: 'Submitted', label: 'Application submitted', description: 'Visitor access request submitted from mobile app.', timestamp: ago(14), actor: 'Miguel Torres' },
      { id: 'VAT-1011-2', status: 'Rejected', label: 'Application rejected', description: 'Request rejected by system admin.', timestamp: ago(13), actor: 'Sophia Reyes' },
    ],
  },
]

export const mockData: AppData = {
  rolePermissions: structuredClone({
    'Super Admin': ['dashboard:view','monitoring:view','vehicles:view','vehicles:manage','applications:view','applications:manage','visitorApplications:view','visitorApplications:manage','owners:view','owners:manage','gates:view','gates:manage','gateControl:operate','cameras:view','cameras:manage','accessRules:view','accessRules:manage','models:view','models:manage','recognitionLogs:view','reports:view','incidents:view','incidents:manage','incidents:report','auditLogs:view','users:view','users:manage','users:assignRoles','roles:view','roles:manage','settings:view','settings:manage','profile:view'],
    'System Admin': ['dashboard:view','monitoring:view','vehicles:view','vehicles:manage','applications:view','applications:manage','visitorApplications:view','visitorApplications:manage','owners:view','owners:manage','gates:view','gates:manage','gateControl:operate','cameras:view','cameras:manage','accessRules:view','accessRules:manage','models:view','models:manage','recognitionLogs:view','reports:view','incidents:view','incidents:manage','auditLogs:view','users:view','users:manage','roles:view','settings:view','settings:manage','profile:view'],
    'Security Personnel': ['dashboard:view','monitoring:view','vehicles:view','applications:view','visitorApplications:view','owners:view','gates:view','gateControl:operate','cameras:view','accessRules:view','models:view','recognitionLogs:view','reports:view','incidents:view','incidents:manage','profile:view'],
    'Gate Operator': ['dashboard:view','monitoring:view','vehicles:view','applications:view','visitorApplications:view','owners:view','gates:view','gateControl:operate','cameras:view','accessRules:view','models:view','recognitionLogs:view','reports:view','incidents:view','incidents:report','profile:view'],
    'Viewer': ['dashboard:view','monitoring:view','vehicles:view','applications:view','visitorApplications:view','owners:view','gates:view','cameras:view','accessRules:view','models:view','recognitionLogs:view','reports:view','incidents:view','profile:view'],
  }),
  vehicles: allVehicles, owners, applications, visitorApplications, gates, cameras,
  accessRules: [
    { id: 'AR-001', name: 'Main entrance resident access', vehicleId: 'VH-001', gateId: 'GT-01', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], startTime: '00:00', endTime: '23:59', expires: day(210), active: true, autoApproval: true },
    { id: 'AR-002', name: 'Employee weekday schedule', vehicleId: 'VH-002', gateId: 'GT-03', days: ['Mon','Tue','Wed','Thu','Fri'], startTime: '06:00', endTime: '20:00', expires: day(95), active: true, autoApproval: true },
    { id: 'AR-003', name: 'Logistics delivery window', vehicleId: 'VH-008', gateId: 'GT-04', days: ['Mon','Wed','Fri'], startTime: '08:00', endTime: '16:00', expires: day(-3), active: true, autoApproval: false },
    { id: 'AR-004', name: 'Suspended motorcycle access', vehicleId: 'VH-005', gateId: 'GT-01', days: ['Sat','Sun'], startTime: '07:00', endTime: '18:00', expires: day(40), active: false, autoApproval: false },
  ],
  recognitionLogs, models, incidents, admins, auditLogs,
  notifications: [
    { id: 'NTF-01', title: 'Unauthorized entry attempt', description: 'XYZ 8891 at Main Entrance', timestamp: ago(1.15), read: false, severity: 'critical' },
    { id: 'NTF-02', title: 'Camera disconnected', description: 'Service Gate Camera is offline', timestamp: ago(5.2), read: false, severity: 'warning' },
    { id: 'NTF-03', title: 'New vehicle application', description: 'Katrina Lim submitted NEB 3478', timestamp: ago(2), read: true, severity: 'info' },
    { id: 'NTF-04', title: 'New visitor application', description: 'Carlo Mendoza requested visitor access (VIS-2026-1006)', timestamp: ago(5), read: false, severity: 'info' },
  ],
  settings: { platformName: 'GateVision', timezone: 'Asia/Manila', dateFormat: 'MMM dd, yyyy', timeFormat: '12-hour', confidenceThreshold: 85, automaticGates: true, emailNotifications: true, pushNotifications: true, incidentAlerts: true, reviewThreshold: 70 },
}

export const trafficData = ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM'].map((time, i) => ({ time, entries: [28,96,130,118,150,189,142,76][i], exits: [18,71,105,122,137,168,159,68][i] }))
export const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({ day, authorized: [782,814,849,825,902,664,518][i], denied: [34,27,42,31,38,46,24][i] }))
export const typeData = types.map((name, i) => ({ name, value: [34,24,12,10,8,4,3,5][i], fill: ['#2563eb','#4f7fee','#7699e8','#53a2b8','#65a98a','#d3a448','#a78b71','#9aa5b5'][i] }))
