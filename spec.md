# DriveEase - V25: Ameyo-Style Staff CRM + Booking Map Fix

## Current State
- StaffCRMPage.tsx: Ameyo-style dark CRM with customer search by phone, comment timeline, call modal (hold/mute/record), tag management, callbacks. No live monitoring dashboard or admin activity view.
- AdminPage.tsx: Has staff/executive management tab, recordings tab, callbacks tab. No live staff activity monitoring.
- BookPage.tsx: Has OpenStreetMap pin selector (click on map to drop pin), but no address autocomplete, no typing-based search, no real-time map update when typing address, no distance calculation from actual route.

## Requested Changes (Diff)

### Add
- **Staff CRM - Live Monitoring Dashboard** (Ameyo-style): New top section showing real-time stats: Total Calls Made Today, Active Staff, Total Customers Contacted, Average Call Duration. Agent list table showing each logged-in staff: name, status (Available/Break/On Call), calls handled, talk time. Per-staff session detail panel (click any staff row).
- **Staff CRM - Call Activity Log**: Every call made by staff is logged with: staff name, customer phone, call type (manual dial), duration, timestamp, disposition tag.
- **Admin Panel - Staff Activity Monitor tab**: New tab in admin showing all staff call logs, activity timeline, which staff is currently active, total calls per staff, recordings linked to staff. Admin can see all activity in one view with filters by staff name, date.
- **BookPage - Address Autocomplete**: When user types in pickup or drop field, use OpenStreetMap Nominatim API (free, no key needed) to fetch India-specific address suggestions. Show dropdown of up to 5 matching addresses. On select, auto-fill address and update map pin.
- **BookPage - Real-time map update**: Embed a persistent Leaflet map on the booking details step (not just in modal) showing both pickup and drop pins simultaneously. When user types or selects an address, map updates in real-time to show the pin.
- **BookPage - Distance auto-calculation**: After both pickup and drop are geocoded, use Haversine formula or OpenRouteService free API to calculate straight-line distance (with 1.3x road multiplier as fallback). Display estimated distance in km and update fare estimate automatically.
- **BookPage - Pickup/drop location via Nominatim**: Replace the coordinate-only label ("Lat: x.xxxx, Lng: y.yyyy") with actual human-readable address after reverse geocoding.

### Modify
- **StaffCRMPage**: Add live stats bar at top (Total Calls, Active Staff, Avg Duration). Add agent activity table. Store call logs with staff name in localStorage for admin to read.
- **AdminPage**: Add "Staff Activity" tab showing all staff call logs, per-staff stats, activity feed.
- **BookPage**: Replace current map modal (pin-only) with inline dual map + address autocomplete with Nominatim + distance calculation.

### Remove
- BookPage coordinate-only labels for address (replace with readable addresses)

## Implementation Plan
1. Create a shared `staffCallLog` store utility (get/save call logs keyed by staff name + timestamp)
2. Update StaffCRMPage: add live monitoring header stats, agent activity table, log every call to staffCallLog store
3. Update AdminPage: add Staff Activity tab reading staffCallLog, showing per-staff stats, full activity timeline
4. Update BookPage:
   - Add Nominatim address autocomplete hooks for pickup and drop fields
   - Add inline Leaflet dual map (shows both pickup & drop pins)
   - Add real-time map update on address select
   - Add distance calculation (Haversine with 1.3x multiplier) and fare update
   - Replace coordinate labels with reverse-geocoded human-readable addresses
