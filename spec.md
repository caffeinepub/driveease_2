# DriveEase V35 Rebrand

## Current State
Light green/white theme on public pages. Admin has dark sidebar with green highlights. All CTAs and accents use green.

## Requested Changes (Diff)

### Add
- Advertisement/branding banner strips on homepage (marquee trust badges, promo banners)
- Tagline branding strip below hero
- Promotional ad strips with offers
- Floating special offer badge on hero

### Modify
- Theme: Replace all green with dark red/crimson and black
- Font: Black text on light backgrounds, white on dark
- Admin sidebar: White background, black text, dark red active states
- CTAs/Buttons: Dark red with white text
- NavBar: Near-black background with white text and dark red highlights
- Splash screen: Dark red accents

### Remove
- All green color values replaced with dark red equivalents

## Implementation Plan
1. Update index.css CSS variables to dark red palette
2. Update Header.tsx with dark navbar and dark red CTAs
3. Update HomePage.tsx with ad/branding banners and dark red theme
4. Update SplashScreen.tsx with dark red accents
5. Update AdminPage.tsx with white sidebar and dark red highlights
6. Update Footer.tsx and all other pages
