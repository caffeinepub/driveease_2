# DriveEase - V29 Comprehensive UI & Feature Update

## Current State
DriveEase V28 is live with Firebase Firestore integration, admin CRM, staff CRM portal, split-hero homepage with cycling luxury photos, booking page with OpenStreetMap, driver registration, my bookings, and all data syncing to Firestore.

## Requested Changes (Diff)

### Add
- Sticky top navigation bar: Home, Book Driver, Become a Driver, My Bookings (auth-gated), Login/Signup + "Book Now" CTA button on right; hamburger menu for mobile
- 4-step booking flow UI with progress bar: (1) Select Location, (2) Choose Driver, (3) Select Date & Time, (4) Confirm Booking — Next/Back buttons, data stored in Firestore
- Trust section on homepage: Verified Drivers badge, 3-5 customer testimonials, Safety Guarantee, 24/7 Support, clean icon layout
- User dashboard (post-login): Active Bookings, Booking History, Profile Settings; booking status (Pending/Confirmed/Completed); cancel booking button
- Free SMS notifications via Textbelt for booking confirmation, driver approval, booking cancellation
- Hero background image of Indian professional driver

### Modify
- Header/Navbar: Replace existing pill nav with clean sticky navbar matching the spec; include auth state for My Bookings visibility
- Homepage hero: Update headline to "Book Professional Drivers Anytime, Anywhere", subtext to "Safe, Verified, Affordable Drivers at Your Service", add two CTAs ("Book a Driver Now" primary + "Become a Driver" secondary), use Indian driver background image
- BookPage: Wrap existing booking in 4-step wizard with progress bar
- DriverRegisterPage: Ensure all fields present (Full Name, Phone+OTP, DL Upload, Experience, City, Profile Photo), status shown (Pending/Approved/Rejected)
- MyBookingsPage: Enhance to full user dashboard with Active/History/Settings tabs, cancel option

### Remove
- Nothing to remove

## Implementation Plan
1. Generate Indian professional driver hero image
2. Update Header.tsx: clean sticky nav, hamburger mobile menu, auth-conditional My Bookings, Book Now CTA
3. Update HomePage.tsx: new hero section with headline/subtext/CTAs/background image; add trust section with testimonials, badges, safety, support
4. Update BookPage.tsx: 4-step wizard with progress bar, per-step forms, Firestore save on confirmation
5. Update MyBookingsPage.tsx: full dashboard with Active Bookings, Booking History, Profile Settings tabs, cancel booking
6. Update DriverRegisterPage.tsx: ensure all fields, OTP verification, file upload, status display
7. Add free SMS via Textbelt in syncService: call on booking confirmed, driver approved, booking cancelled
8. Mobile optimization across all pages
