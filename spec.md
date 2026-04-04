# DriveEase - V43 Theme Update

## Current State
- Theme is dark (black/dark backgrounds) with green and yellow-gold accents throughout
- Homepage has a scrolling promotional marquee/banner strip at the top with bubble animations
- Admin panel login page uses dark navy (#0f172a) background with dark red gradient accents
- Font colors are mostly white/light on dark backgrounds
- CSS variables and utility classes use yellow-gold (#F5C100) as primary color
- Header/Navbar uses dark charcoal background

## Requested Changes (Diff)

### Add
- Dark Green (#166534 / #15803D) as the new primary brand color throughout
- White backgrounds for main page sections (public website)
- Black font color for all body text on white backgrounds
- Admin login page redesigned to match a premium CRM style: white/light card on dark green background, with DriveEase branding prominently displayed

### Modify
- `index.css`: Update CSS variables - primary to dark green, backgrounds to white, text to black
- `Header.tsx`: Change navbar background to dark green with white text/links, Book Now button in white or accent color
- `HomePage.tsx`: Remove the entire scrolling promotional banner (marquee strip + bubble animation at top). Update hero and all sections to use dark green + white + black font theme
- `AdminPage.tsx` LoginPage component: Redesign to dark green background with white card, green gradient button, professional CRM look
- All `.red-btn`, `.green-btn`, sparkle buttons, badge classes: update to dark green primary
- `SplashScreen.tsx`: Update to dark green + white theme
- `DriverLoginPage.tsx`, `DriverRegisterPage.tsx`: Update to dark green + white theme

### Remove
- Scrolling marquee/promotional banner strip from HomePage (the entire ANNOUNCEMENT STRIP section with bubble animations)
- All yellow-gold (#F5C100) color references - replace with dark green
- Dark black/charcoal backgrounds on public-facing pages (replace with white)

## Implementation Plan
1. Update `index.css` - new CSS variables: dark green primary (oklch ~0.4 0.14 145), white background, black foreground. Update all utility classes (.red-btn, .green-btn, badge classes, sparkle buttons) to use dark green.
2. Update `Header.tsx` - dark green navbar background (#166534), white nav links, white logo text, green CTA button
3. Update `HomePage.tsx` - remove entire ANNOUNCEMENT STRIP block (lines ~267-355). Update hero section and all other sections to white background, black text, dark green accents
4. Update `AdminPage.tsx` LoginPage - change background to dark green gradient, white card, green accent button, premium look matching a professional CRM
5. Update `SplashScreen.tsx` - dark green theme with white text
6. Update `DriverLoginPage.tsx` and `DriverRegisterPage.tsx` - dark green + white theme
