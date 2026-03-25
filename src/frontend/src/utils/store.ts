import { getAvatar } from "../data/drivers";
import type { Driver } from "../data/drivers";

const KEYS = {
  drivers: "de_drivers",
  bookings: "de_bookings",
  registrations: "de_registrations",
  customers: "de_customers",
  enquiries: "de_enquiries",
  subEnquiries: "de_sub_enquiries",
  currentCustomer: "de_current_customer",
  currentDriver: "de_current_driver",
  savedAddresses: "de_saved_addresses",
  pricingConfig: "de_pricing_config",
  callRecordings: "de_call_recordings",
  callbackRequests: "de_callback_requests",
};

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Pricing Config ----
export interface PricingConfig {
  baseFare: number;
  ratePerKm: number;
  ratePerMin: number;
  minimumFare: number;
  nightSurchargePercent: number;
  commissionPercent: number;
}

const DEFAULT_PRICING: PricingConfig = {
  baseFare: 50,
  ratePerKm: 15,
  ratePerMin: 2,
  minimumFare: 120,
  nightSurchargePercent: 20,
  commissionPercent: 15,
};

export function getPricingConfig(): PricingConfig {
  return get<PricingConfig>(KEYS.pricingConfig, DEFAULT_PRICING);
}
export function savePricingConfig(c: PricingConfig): void {
  set(KEYS.pricingConfig, c);
}

export function calculateFare(
  distanceKm: number,
  durationMin: number,
  bookingTime: Date,
): {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  subtotal: number;
  nightSurcharge: number;
  total: number;
  isNightCharge: boolean;
} {
  const cfg = getPricingConfig();
  const baseFare = cfg.baseFare;
  const distanceFare = distanceKm * cfg.ratePerKm;
  const timeFare = durationMin * cfg.ratePerMin;
  const subtotal = baseFare + distanceFare + timeFare;
  const hour = bookingTime.getHours();
  const isNightCharge = hour >= 22 || hour < 6;
  const beforeSurcharge = Math.max(cfg.minimumFare, subtotal);
  const nightSurcharge = isNightCharge
    ? Math.round(beforeSurcharge * (cfg.nightSurchargePercent / 100))
    : 0;
  const total = beforeSurcharge + nightSurcharge;
  return {
    baseFare,
    distanceFare,
    timeFare,
    subtotal,
    nightSurcharge,
    total,
    isNightCharge,
  };
}

export function initStore() {
  if (!localStorage.getItem(KEYS.drivers)) set(KEYS.drivers, []);
  if (!localStorage.getItem(KEYS.bookings)) set(KEYS.bookings, []);
  if (!localStorage.getItem(KEYS.registrations)) set(KEYS.registrations, []);
  if (!localStorage.getItem(KEYS.customers)) set(KEYS.customers, []);
  if (!localStorage.getItem(KEYS.enquiries)) set(KEYS.enquiries, []);
  if (!localStorage.getItem(KEYS.subEnquiries)) set(KEYS.subEnquiries, []);
  if (!localStorage.getItem(KEYS.pricingConfig))
    set(KEYS.pricingConfig, DEFAULT_PRICING);
}

export function getDrivers(): Driver[] {
  return get<Driver[]>(KEYS.drivers, []);
}
export function saveDrivers(d: Driver[]) {
  set(KEYS.drivers, d);
}

export function generateRideOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  nightSurcharge: number;
  total: number;
  isNightCharge: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId: string;
  driverName: string;
  driverCity: string;
  pickup: string;
  drop: string;
  startDate: string;
  endDate: string;
  days: number;
  amount: number;
  insurance: boolean;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "in-progress";
  createdAt: string;
  rideOtp?: string;
  rideOtpStatus?: "pending" | "verified";
  // Extended ride state fields
  rideState?:
    | "searching"
    | "assigned"
    | "arrived"
    | "started"
    | "completed"
    | "cancelled";
  distanceKm?: number;
  durationMin?: number;
  fareBreakdown?: FareBreakdown;
  paymentMethod?: "UPI" | "Card" | "Wallet" | "Postpaid";
  driverArrivedAt?: string;
  noShowAt?: string;
  commissionAmount?: number;
  driverEarnings?: number;
}

export function getBookings(): Booking[] {
  return get<Booking[]>(KEYS.bookings, []);
}
export function addBooking(b: Booking) {
  const arr = getBookings();
  arr.unshift(b);
  set(KEYS.bookings, arr);
}
export function updateBooking(id: string, patch: Partial<Booking>) {
  const arr = getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
  set(KEYS.bookings, arr);
}
export function updateBookingRideOtp(id: string, status: "verified") {
  updateBooking(id, { rideOtpStatus: status, status: "in-progress" });
}
export function updateBookingRideState(
  id: string,
  state: Booking["rideState"],
) {
  updateBooking(id, { rideState: state });
}

export interface Registration {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  experience: number;
  vehicleType: string;
  languages: string;
  aadharDesc: string;
  dlDesc: string;
  selfieDesc: string;
  paymentRef: string;
  paymentScreenshot?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}
export function getRegistrations(): Registration[] {
  return get<Registration[]>(KEYS.registrations, []);
}
export function addRegistration(r: Registration) {
  const arr = getRegistrations();
  arr.unshift(r);
  set(KEYS.registrations, arr);
}
export function updateRegistration(id: string, patch: Partial<Registration>) {
  const arr = getRegistrations().map((r) =>
    r.id === id ? { ...r, ...patch } : r,
  );
  set(KEYS.registrations, arr);
  if (patch.status === "approved") {
    const reg = arr.find((r) => r.id === id);
    if (reg) {
      const drivers = getDrivers();
      const exists = drivers.find((d) => d.phone === reg.phone);
      if (!exists) {
        const newD: Driver = {
          id: `dr_${reg.id}`,
          name: reg.name,
          phone: reg.phone,
          city: reg.city,
          state: reg.state,
          pincode: "000000",
          experience: reg.experience,
          rating: 4.5,
          languages: reg.languages.split(","),
          vehicleTypes: [reg.vehicleType],
          isOnline: false,
          isApproved: true,
          licenseNumber: "N/A",
          trustBadges: ["Newly Verified"],
          totalTrips: 0,
          totalEarnings: 0,
          dailyRate: 800,
          avatar: getAvatar(reg.name),
        };
        drivers.push(newD);
        saveDrivers(drivers);
      }
    }
  }
}

export interface Customer {
  phone: string;
  name: string;
  loginTime: string;
}
export function getCustomers(): Customer[] {
  return get<Customer[]>(KEYS.customers, []);
}
export function loginCustomer(phone: string, name: string) {
  const arr = getCustomers();
  const c: Customer = { phone, name, loginTime: new Date().toISOString() };
  const idx = arr.findIndex((x) => x.phone === phone);
  if (idx >= 0) arr[idx] = c;
  else arr.unshift(c);
  set(KEYS.customers, arr);
  set(KEYS.currentCustomer, c);
}
export function getCurrentCustomer(): Customer | null {
  return get<Customer | null>(KEYS.currentCustomer, null);
}
export function logoutCustomer() {
  localStorage.removeItem(KEYS.currentCustomer);
}

export interface DriverSession {
  phone: string;
  name: string;
  isOnline: boolean;
  onlineSince?: string;
}
export function getCurrentDriver(): DriverSession | null {
  return get<DriverSession | null>(KEYS.currentDriver, null);
}
export function setCurrentDriver(d: DriverSession) {
  set(KEYS.currentDriver, d);
}
export function logoutDriver() {
  localStorage.removeItem(KEYS.currentDriver);
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: "open" | "closed";
  adminReply: string;
  createdAt: string;
}
export function getEnquiries(): Enquiry[] {
  return get<Enquiry[]>(KEYS.enquiries, []);
}
export function addEnquiry(e: Enquiry) {
  const arr = getEnquiries();
  arr.unshift(e);
  set(KEYS.enquiries, arr);
}
export function updateEnquiry(id: string, patch: Partial<Enquiry>) {
  set(
    KEYS.enquiries,
    getEnquiries().map((e) => (e.id === id ? { ...e, ...patch } : e)),
  );
}

export interface SubEnquiry {
  id: string;
  name: string;
  phone: string;
  plan: string;
  createdAt: string;
}
export function getSubEnquiries(): SubEnquiry[] {
  return get<SubEnquiry[]>(KEYS.subEnquiries, []);
}
export function addSubEnquiry(e: SubEnquiry) {
  const arr = getSubEnquiries();
  arr.unshift(e);
  set(KEYS.subEnquiries, arr);
}

export function getSavedAddresses(phone: string): string[] {
  const all = get<Record<string, string[]>>(KEYS.savedAddresses, {});
  return all[phone] || [];
}
export function saveAddress(phone: string, addr: string) {
  const all = get<Record<string, string[]>>(KEYS.savedAddresses, {});
  const arr = all[phone] || [];
  if (!arr.includes(addr)) arr.push(addr);
  all[phone] = arr;
  set(KEYS.savedAddresses, all);
}

// ---- Wallet ----
export interface WalletTransaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  date: string;
}
export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}
export function getWallet(phone: string): Wallet {
  return get<Wallet>(`de_wallet_${phone}`, { balance: 0, transactions: [] });
}
export function addWalletTransaction(
  phone: string,
  amount: number,
  type: "credit" | "debit",
  description: string,
) {
  const w = getWallet(phone);
  const tx: WalletTransaction = {
    id: uid(),
    amount,
    type,
    description,
    date: new Date().toISOString(),
  };
  w.transactions.unshift(tx);
  w.balance =
    type === "credit" ? w.balance + amount : Math.max(0, w.balance - amount);
  set(`de_wallet_${phone}`, w);
}

// ---- Comments ----
export function getComment(recordId: string): string {
  return localStorage.getItem(`de_comment_${recordId}`) || "";
}
export function saveComment(recordId: string, comment: string): void {
  localStorage.setItem(`de_comment_${recordId}`, comment);
}

// ---- Call Recordings ----
export interface CallRecording {
  id: string;
  staffName: string;
  customerName: string;
  customerPhone: string;
  recordedAt: string;
  durationSecs: number;
  notes: string;
}
export function getCallRecordings(): CallRecording[] {
  return get<CallRecording[]>(KEYS.callRecordings, []);
}
export function saveCallRecording(r: CallRecording): void {
  const arr = getCallRecordings();
  arr.unshift(r);
  set(KEYS.callRecordings, arr);
}
export function clearCallRecordings(): void {
  set(KEYS.callRecordings, []);
}

// ---- Callback Requests ----
export interface CallbackRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
  status: "pending" | "done";
  note: string;
}
export function getCallbackRequests(): CallbackRequest[] {
  return get<CallbackRequest[]>(KEYS.callbackRequests, []);
}
export function saveCallbackRequest(r: CallbackRequest): void {
  const arr = getCallbackRequests();
  arr.unshift(r);
  set(KEYS.callbackRequests, arr);
}
export function updateCallbackRequest(
  id: string,
  patch: Partial<CallbackRequest>,
): void {
  set(
    KEYS.callbackRequests,
    getCallbackRequests().map((r) => (r.id === id ? { ...r, ...patch } : r)),
  );
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ---- Comment History (timestamped) ----
export interface CommentEntry {
  id: string;
  recordId: string;
  staffName: string;
  text: string;
  createdAt: string;
}
export function getCommentHistory(recordId: string): CommentEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(`de_comment_hist_${recordId}`) || "[]",
    );
  } catch {
    return [];
  }
}
export function addCommentEntry(
  recordId: string,
  staffName: string,
  text: string,
): void {
  const arr = getCommentHistory(recordId);
  arr.unshift({
    id: uid(),
    recordId,
    staffName,
    text,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(`de_comment_hist_${recordId}`, JSON.stringify(arr));
}

// ---- Customer Notes ----
export interface CustomerNote {
  id: string;
  phone: string;
  staffName: string;
  tag: string;
  notes: string;
  updatedAt: string;
}
export function getCustomerNote(phone: string): CustomerNote | null {
  try {
    const v = localStorage.getItem(`de_cust_note_${phone}`);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export function saveCustomerNote(n: CustomerNote): void {
  localStorage.setItem(`de_cust_note_${n.phone}`, JSON.stringify(n));
}

// ---- Staff Call Logs ----
export interface StaffCallLog {
  id: string;
  staffName: string;
  staffEmail: string;
  customerPhone: string;
  customerName: string;
  callType: "manual-dial" | "callback";
  duration: number;
  timestamp: string;
  disposition: string;
  notes: string;
}

export function getStaffCallLogs(): StaffCallLog[] {
  return get<StaffCallLog[]>("de_staff_call_logs", []);
}
export function saveStaffCallLog(log: StaffCallLog): void {
  const logs = getStaffCallLogs();
  set("de_staff_call_logs", [log, ...logs].slice(0, 500));
}
export function getStaffActivity(): {
  staffName: string;
  callsToday: number;
  totalDurationToday: number;
  lastActive: string;
}[] {
  const logs = getStaffCallLogs();
  const today = new Date().toDateString();
  const todayLogs = logs.filter(
    (l) => new Date(l.timestamp).toDateString() === today,
  );
  const map: Record<string, { calls: number; duration: number; last: string }> =
    {};
  for (const l of todayLogs) {
    if (!map[l.staffName])
      map[l.staffName] = { calls: 0, duration: 0, last: l.timestamp };
    map[l.staffName].calls++;
    map[l.staffName].duration += l.duration;
    if (l.timestamp > map[l.staffName].last)
      map[l.staffName].last = l.timestamp;
  }
  return Object.entries(map).map(([name, d]) => ({
    staffName: name,
    callsToday: d.calls,
    totalDurationToday: d.duration,
    lastActive: d.last,
  }));
}
