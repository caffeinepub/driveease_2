# DriveEase

## Current State
- All user-submitted data (bookings, enquiries, driver registrations, plan enquiries, customer profiles, staff comments, callbacks) is stored exclusively in browser localStorage
- This makes all data device/browser-specific: admin or staff logging in from any other device sees zero data
- Backend canister only has authorization and blob-storage mixins; no business data is stored on-chain

## Requested Changes (Diff)

### Add
- Backend Motoko canister stores: Bookings, Enquiries, Plan/Subscription Enquiries, Driver Registrations, Customers, Staff Comments (per record), Call Records, Callback Requests
- Each data type has create, read, list, and update functions
- Admin/staff can list all records from any device
- Unique IDs generated per record (timestamp + random)
- IST timestamps stored as text

### Modify
- BookPage: submit booking to canister instead of/in addition to localStorage
- PlansPage: submit plan enquiry to canister
- DriverRegisterPage: submit registration to canister
- HomePage (enquiry form): submit enquiry to canister
- AdminPage: read bookings, enquiries, registrations, customers, comments, recordings, callbacks from canister
- StaffCRMPage: read/write customer records, comments, call records, callbacks from canister
- MyBookingsPage: read customer's own bookings from canister (filter by phone)

### Remove
- localStorage as the sole source of truth for business data (keep as offline cache/fallback only)

## Implementation Plan
1. Generate Motoko backend with all required data types and CRUD functions
2. Update frontend pages to call backend actor for all data submission and retrieval
3. Admin and staff pages pull all data from canister -- visible from any device, any login
4. Validate and deploy
