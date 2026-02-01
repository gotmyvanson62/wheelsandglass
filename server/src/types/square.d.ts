declare module 'square' {
  export enum Environment {
    Production = 'production',
    Sandbox = 'sandbox',
  }

  export interface ClientOptions {
    accessToken: string;
    environment: Environment;
    userAgentDetail?: string;
  }

  export class Client {
    constructor(options: ClientOptions);

    paymentsApi: {
      createPayment(request: any): Promise<any>;
      getPayment(paymentId: string): Promise<any>;
      listPayments(params?: any): Promise<any>;
    };

    checkoutApi: {
      createPaymentLink(request: any): Promise<any>;
      retrievePaymentLink(id: string): Promise<any>;
      listPaymentLinks(params?: any): Promise<any>;
      updatePaymentLink(id: string, request: any): Promise<any>;
      deletePaymentLink(id: string): Promise<any>;
    };

    bookingsApi: {
      createBooking(request: any): Promise<any>;
      retrieveBooking(bookingId: string): Promise<any>;
      listBookings(params?: any): Promise<any>;
      updateBooking(bookingId: string, request: any): Promise<any>;
      cancelBooking(bookingId: string, request?: any): Promise<any>;
      searchAvailability(request: any): Promise<any>;
    };

    locationsApi: {
      listLocations(): Promise<any>;
      retrieveLocation(locationId: string): Promise<any>;
    };

    catalogApi: {
      listCatalog(params?: any): Promise<any>;
      retrieveCatalogObject(objectId: string, params?: any): Promise<any>;
      searchCatalogItems(request: any): Promise<any>;
      searchCatalogObjects(request: any): Promise<any>;
      upsertCatalogObject(request: any): Promise<any>;
    };

    customersApi: {
      createCustomer(request: any): Promise<any>;
      retrieveCustomer(customerId: string): Promise<any>;
      listCustomers(params?: any): Promise<any>;
      updateCustomer(customerId: string, request: any): Promise<any>;
      deleteCustomer(customerId: string): Promise<any>;
      searchCustomers(request: any): Promise<any>;
    };

    teamApi: {
      searchTeamMembers(request: any): Promise<any>;
      listTeamMemberBookingProfiles(params?: any): Promise<any>;
      retrieveTeamMemberBookingProfile(teamMemberId: string): Promise<any>;
    };

    ordersApi: {
      createOrder(request: any): Promise<any>;
      retrieveOrder(orderId: string): Promise<any>;
      searchOrders(request: any): Promise<any>;
      updateOrder(orderId: string, request: any): Promise<any>;
      payOrder(orderId: string, request: any): Promise<any>;
    };
  }
}
