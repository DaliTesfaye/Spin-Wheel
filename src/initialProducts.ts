import type { Product } from "./types";

// Predefined products that will be automatically added to the database
export const INITIAL_PRODUCTS: Omit<Product, "id">[] = [
  {
    uniqueKey: "1",
    name: "Friteuse",
    image: "/images/products/airfryer.png",
    remaining: 1,
    active: true,
    probability: 5,
  },
  {
    uniqueKey: "2",
    name: "A la Prochaine",
    image:
      "https://imgs.search.brave.com/nsiGlyISticIptpic58hVto5HUTem6f76y5MqA_t5bE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYWls/ZWQtcmVkLXJ1YmJl/ci1zdGFtcC1vdmVy/LXdoaXRlLWJhY2tn/cm91bmQtODg0MTIz/MTQuanBn",
    remaining: 999999,
    active: true,
    probability: 10,
  },
  {
    uniqueKey: "3",
    name: "Peole",
    image: "/images/products/frying.png",
    remaining: 50,
    active: true,
    probability: 15,
  },
  {
    uniqueKey: "4",
    name: "Magnet",
    image: "/images/products/MAGNET JADIDA1.png",
    remaining: 50,
    probability: 15,
    active: true,
  },

  {
    uniqueKey: "5",
    probability: 15,
    name: "Tablier Cuisine",
    image: "/images/products/TABLIER_jadida.png",
    remaining: 30,
    active: true,
  },

  {
    uniqueKey: "6",
    name: "Pince Friture",
    probability: 15,
    image: "/images/products/pince.png",
    remaining: 20,
    active: true,
  },
  {
    uniqueKey: "7",
    name: "A la Prochaine",
    probability: 10,
    image:
      "https://imgs.search.brave.com/nsiGlyISticIptpic58hVto5HUTem6f76y5MqA_t5bE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYWls/ZWQtcmVkLXJ1YmJl/ci1zdGFtcC1vdmVy/LXdoaXRlLWJhY2tn/cm91bmQtODg0MTIz/MTQuanBn",
    remaining: 999999,
    active: true,
  },
  {
    uniqueKey: "8",
    name: "Magnet",
    image: "/images/products/MAGNET JADIDA3.png",
    probability: 15,
    remaining: 50,
    active: true,
  },
];
