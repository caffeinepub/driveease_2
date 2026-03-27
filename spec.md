# DriveEase - Zoomcar Theme Redesign

## Current State
The app currently uses a vibrant multi-color theme (light red, blue, yellow, green gradients) across all pages including homepage, splash screen, 'Become a Driver', Driver Login, booking page, and admin panel. Animated stars and multicolor gradients are used extensively.

## Requested Changes (Diff)

### Add
- Zoomcar-inspired unified theme: dark charcoal/black backgrounds (#1a1a1a, #111111, #222222) with bold orange-yellow accent (#FF6200 or #F5A623), white/light gray text
- Clean, professional car rental aesthetic matching Zoomcar's brand: dark headers, orange CTA buttons, white cards with subtle shadows
- Orange accent color for all buttons, highlights, borders, and active states

### Modify
- Remove ALL multicolor gradients (red+blue+yellow+green) from every page
- Remove animated star particles from DriverLoginPage and DriverRegisterPage
- Replace with Zoomcar-style dark background + orange accent on those pages
- SplashScreen: change to dark background with orange logo glow instead of white-to-mint gradient
- Header/Navbar: dark background with orange CTA button
- Homepage hero: dark overlay with orange CTAs
- Booking page: dark cards with orange accents
- Admin panel sidebar: dark with orange highlights (keep white sidebar option but with orange accents)
- Footer: dark background with orange links
- RideQuoteTicker: dark styling
- index.css global CSS variables updated to Zoomcar palette
- All gradient text (multicolor) → solid orange or white
- All multicolor buttons → solid orange (#FF6200) with white text

### Remove
- All `from-red-* via-blue-* to-yellow-*` or similar multicolor gradient classes
- Star particle animations on driver pages
- Green/blue/yellow/red mixed color schemes

## Implementation Plan
1. Update index.css CSS variables to Zoomcar palette (dark bg, orange primary)
2. Update Header.tsx - dark nav, orange Book Now button
3. Update SplashScreen.tsx - dark theme, orange glow
4. Update HomePage.tsx - remove multicolor, apply dark+orange
5. Update DriverRegisterPage.tsx - remove stars/multicolor, dark+orange
6. Update DriverLoginPage.tsx - remove stars/multicolor, dark+orange
7. Update BookPage.tsx - dark cards with orange accents
8. Update PlansPage.tsx, DriversPage.tsx, MyBookingsPage.tsx, PaymentPage.tsx - consistent dark+orange
9. Update Footer.tsx, ChatBot.tsx, RideQuoteTicker.tsx - dark+orange
10. Update AdminPage.tsx sidebar and accents to orange
11. Validate build
