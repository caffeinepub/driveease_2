import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Text "mo:base/Text";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ---- Types ----

  public type Booking = {
    id: Text;
    customerName: Text;
    customerPhone: Text;
    pickup: Text;
    drop: Text;
    distanceKm: Text;
    fare: Text;
    status: Text;
    bookingType: Text;
    createdAt: Text;
    notes: Text;
  };

  public type Enquiry = {
    id: Text;
    name: Text;
    phone: Text;
    city: Text;
    message: Text;
    service: Text;
    createdAt: Text;
    status: Text;
  };

  public type PlanEnquiry = {
    id: Text;
    name: Text;
    phone: Text;
    city: Text;
    planName: Text;
    planPrice: Text;
    createdAt: Text;
    status: Text;
  };

  public type DriverRegistration = {
    id: Text;
    name: Text;
    phone: Text;
    city: Text;
    licenseNo: Text;
    vehicleType: Text;
    status: Text;
    createdAt: Text;
    notes: Text;
  };

  public type Customer = {
    id: Text;
    name: Text;
    phone: Text;
    city: Text;
    createdAt: Text;
    tags: [Text];
    totalBookings: Nat;
  };

  public type StaffComment = {
    id: Text;
    recordId: Text;
    recordType: Text;
    staffName: Text;
    comment: Text;
    createdAt: Text;
  };

  public type CallRecord = {
    id: Text;
    recordId: Text;
    recordType: Text;
    staffName: Text;
    duration: Text;
    notes: Text;
    createdAt: Text;
  };

  public type CallbackRequest = {
    id: Text;
    customerName: Text;
    customerPhone: Text;
    bookingId: Text;
    message: Text;
    status: Text;
    createdAt: Text;
  };

  // ---- Storage ----

  var bookings : [Booking] = [];
  var enquiries : [Enquiry] = [];
  var planEnquiries : [PlanEnquiry] = [];
  var driverRegistrations : [DriverRegistration] = [];
  var customers : [Customer] = [];
  var staffComments : [StaffComment] = [];
  var callRecords : [CallRecord] = [];
  var callbackRequests : [CallbackRequest] = [];

  func genId() : Text {
    Int.toText(Time.now())
  };

  // ---- Bookings ----

  public func createBooking(b: Booking) : async Text {
    let newId = if (b.id == "") genId() else b.id;
    let entry = { b with id = newId };
    bookings := Array.append(bookings, [entry]);
    newId
  };

  public query func listAllBookings() : async [Booking] {
    bookings
  };

  public func updateBookingStatus(id: Text, status: Text) : async Bool {
    bookings := Array.map<Booking, Booking>(bookings, func(b) {
      if (b.id == id) { { b with status = status } } else b
    });
    true
  };

  // ---- Enquiries ----

  public func createEnquiry(e: Enquiry) : async Text {
    let newId = if (e.id == "") genId() else e.id;
    let entry = { e with id = newId };
    enquiries := Array.append(enquiries, [entry]);
    newId
  };

  public query func listAllEnquiries() : async [Enquiry] {
    enquiries
  };

  public func updateEnquiryStatus(id: Text, status: Text) : async Bool {
    enquiries := Array.map<Enquiry, Enquiry>(enquiries, func(e) {
      if (e.id == id) { { e with status = status } } else e
    });
    true
  };

  // ---- Plan Enquiries ----

  public func createPlanEnquiry(p: PlanEnquiry) : async Text {
    let newId = if (p.id == "") genId() else p.id;
    let entry = { p with id = newId };
    planEnquiries := Array.append(planEnquiries, [entry]);
    newId
  };

  public query func listAllPlanEnquiries() : async [PlanEnquiry] {
    planEnquiries
  };

  public func updatePlanEnquiryStatus(id: Text, status: Text) : async Bool {
    planEnquiries := Array.map<PlanEnquiry, PlanEnquiry>(planEnquiries, func(p) {
      if (p.id == id) { { p with status = status } } else p
    });
    true
  };

  // ---- Driver Registrations ----

  public func createDriverRegistration(d: DriverRegistration) : async Text {
    let newId = if (d.id == "") genId() else d.id;
    let entry = { d with id = newId };
    driverRegistrations := Array.append(driverRegistrations, [entry]);
    newId
  };

  public query func listAllDriverRegistrations() : async [DriverRegistration] {
    driverRegistrations
  };

  public func updateDriverRegistrationStatus(id: Text, status: Text, notes: Text) : async Bool {
    driverRegistrations := Array.map<DriverRegistration, DriverRegistration>(driverRegistrations, func(d) {
      if (d.id == id) { { d with status = status; notes = notes } } else d
    });
    true
  };

  // ---- Customers ----

  public func createOrUpdateCustomer(c: Customer) : async Text {
    let existing = Array.find(customers, func(x : Customer) : Bool { x.phone == c.phone });
    switch (existing) {
      case (?_) {
        customers := Array.map<Customer, Customer>(customers, func(x) {
          if (x.phone == c.phone) { c } else x
        });
        c.phone
      };
      case null {
        let newId = if (c.id == "") genId() else c.id;
        let entry = { c with id = newId };
        customers := Array.append(customers, [entry]);
        newId
      };
    }
  };

  public query func listAllCustomers() : async [Customer] {
    customers
  };

  public query func getCustomerByPhone(phone: Text) : async ?Customer {
    Array.find(customers, func(c : Customer) : Bool { c.phone == phone })
  };

  // ---- Staff Comments ----

  public func addStaffComment(sc: StaffComment) : async Text {
    let newId = genId();
    let entry = { sc with id = newId };
    staffComments := Array.append(staffComments, [entry]);
    newId
  };

  public query func getStaffComments(recordId: Text) : async [StaffComment] {
    Array.filter<StaffComment>(staffComments, func(sc) { sc.recordId == recordId })
  };

  public query func listAllStaffComments() : async [StaffComment] {
    staffComments
  };

  // ---- Call Records ----

  public func addCallRecord(cr: CallRecord) : async Text {
    let newId = genId();
    let entry = { cr with id = newId };
    callRecords := Array.append(callRecords, [entry]);
    newId
  };

  public query func listAllCallRecords() : async [CallRecord] {
    callRecords
  };

  // ---- Callback Requests ----

  public func createCallbackRequest(cb: CallbackRequest) : async Text {
    let newId = if (cb.id == "") genId() else cb.id;
    let entry = { cb with id = newId };
    callbackRequests := Array.append(callbackRequests, [entry]);
    newId
  };

  public query func listAllCallbackRequests() : async [CallbackRequest] {
    callbackRequests
  };

  public func updateCallbackStatus(id: Text, status: Text) : async Bool {
    callbackRequests := Array.map<CallbackRequest, CallbackRequest>(callbackRequests, func(cb) {
      if (cb.id == id) { { cb with status = status } } else cb
    });
    true
  };
};
