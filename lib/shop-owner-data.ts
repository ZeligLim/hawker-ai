export type Booth = {
  id: string;
  name: string;
  location: string;
  status: 'Open' | 'Closed';
  orders: number;
  revenue: number;
  averageOrder: number;
};

export const booths: Booth[] = [
  { id: 'ah-seng', name: 'Ah Seng Chicken Rice', location: 'Central Market · B12', status: 'Open', orders: 384, revenue: 4280, averageOrder: 11.15 },
  { id: 'penang-corner', name: 'Penang Corner', location: 'Central Market · B14', status: 'Open', orders: 296, revenue: 3510, averageOrder: 11.86 },
  { id: 'curry-house', name: 'Curry House', location: 'Central Market · B18', status: 'Closed', orders: 218, revenue: 2740, averageOrder: 12.57 },
  { id: 'green-garden', name: 'Green Garden Vegetarian', location: 'Central Market · B20', status: 'Open', orders: 257, revenue: 2980, averageOrder: 11.60 },
];
