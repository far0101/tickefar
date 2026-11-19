export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Sector {
  name: string;
  price: number;
  availableTickets: number;
}

export interface Venue {
  _id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  sectors: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface Event {
  _id: string;
  title: string;
  artist: string;
  category: 'Recital' | 'Freestyle' | 'Teatro' | 'Stand-Up';
  dates: string[];
  imageUrl: string;
  venue: Venue;
  sectors: Sector[];
}

export interface Ticket {
  _id: string;
  user: string;
  event: Event;
  eventDate: string;
  sectorName: string;
  quantity: number;
  totalPrice: number;
  purchaseCode: string;
  createdAt: string;
}
