# DriveEase - Enhancement Sprint

## Current State
DriveEase is a fully functional driver booking platform with:
- Homepage with 3D-style CTA buttons
- Driver registration (3-step with KYC docs + ₹150 payment)
- Driver login portal with online/offline toggle and active ride management
- Booking flow with fare estimate, ride states, OTP verification
- Live Drivers page with city/state filters
- Admin panel with full CRM (registrations, bookings, pricing, analytics, sync)
- My Bookings page with wallet, fare breakdown, ride stepper
- Plans, Insurance, Payment pages
- IST timestamps throughout
- PWA install button

## Requested Changes (Diff)

### Add
- **AI Chatbot**: Floating button (bottom right), opens a chat panel with canned smart responses about bookings, pricing, driver info, and support. Responses should feel intelligent and contextual.
- **Interactive Map Visualization**: On LiveDriversPage and BookPage, add a simulated map canvas (using CSS grid/SVG or canvas) showing driver dots with blinking green pulse animation, route line from pickup to drop, distance and ETA display
- **Blinking Driver Markers**: Live driver cards get pulsing green ring animation for online drivers
- **Futuristic Homepage Overhaul**: More glassmorphism, animated gradient orbs in background, Orbitron font for headings, neon-glow borders, 3D bubble buttons with perspective transform on hover
- **SMS Confirmation Toast**: After booking confirmation, show a toast notification simulating SMS sent confirmation
- **Route & ETA display in Book page**: Show simulated distance (based on pickup/drop text hash), ETA in minutes, and a mini route card
- **Driver Tracking Simulation**: In active booking, show animated driver approach with progress indicator

### Modify
- **Header**: Add Driver Login button prominently in nav (not just bottom-left portal link)
- **Live Drivers Page**: Enhance driver cards with pulsing online indicator, approximate ETA badge, better city filtering
- **Admin Panel**: Ensure live sync badge shows prominently, add sound notification toggle
- **Book Page**: Add map-style route visualization section between fare estimate and confirm step

### Remove
- Nothing to remove

## Implementation Plan
1. Create `ChatBot.tsx` component - floating button + slide-up chat panel with smart Q&A
2. Create `MapCanvas.tsx` - SVG-based simulated map with driver dots, route lines, ETA
3. Update `HomePage.tsx` - Orbitron font import, glassmorphism hero, animated gradient orbs, neon 3D buttons
4. Update `LiveDriversPage.tsx` - add MapCanvas, pulsing driver dots, ETA badges
5. Update `BookPage.tsx` - add route visualization card with distance/ETA
6. Update `App.tsx` - render ChatBot globally
7. Update `Header.tsx` - add visible Driver Login nav link
8. Update CSS (`index.css`) - add pulse animations, glow effects, Orbitron font
