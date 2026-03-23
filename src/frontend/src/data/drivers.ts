export interface Driver {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  experience: number;
  rating: number;
  languages: string[];
  vehicleTypes: string[];
  isOnline: boolean;
  isApproved: boolean;
  licenseNumber: string;
  trustBadges: string[];
  totalTrips: number;
  totalEarnings: number;
  avatar: string;
  dailyRate: number;
}

const avatarColors = [
  "#16a34a",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
];
export const getAvatar = (name: string) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = avatarColors[name.charCodeAt(0) % avatarColors.length];
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect width='60' height='60' rx='30' fill='${encodeURIComponent(color)}'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='22' fill='white' font-family='Arial'>${initials}</text></svg>`;
};

export const SEED_DRIVERS: Driver[] = [];

export const CITY_PINCODES: Record<string, string> = {
  "110001": "Delhi",
  "400001": "Mumbai",
  "560001": "Bangalore",
  "600001": "Chennai",
  "500001": "Hyderabad",
  "700001": "Kolkata",
  "411001": "Pune",
  "380001": "Ahmedabad",
  "302001": "Jaipur",
  "226001": "Lucknow",
  "208001": "Kanpur",
  "221001": "Varanasi",
  "440001": "Nagpur",
  "452001": "Indore",
  "462001": "Bhopal",
  "800001": "Patna",
  "834001": "Ranchi",
  "751001": "Bhubaneswar",
  "682001": "Kochi",
  "160001": "Chandigarh",
  "248001": "Dehradun",
  "171001": "Shimla",
  "122001": "Gurgaon",
};
