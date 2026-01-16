import type { Product } from "./types";

// Predefined products that will be automatically added to the database
export const INITIAL_PRODUCTS: Omit<Product, "id">[] = [
  {
    uniqueKey: "1",
    name: "Air Fryer",
    image: "/images/products/airfryer.png",
    remaining: 1,
    active: true,

  },
  {
    uniqueKey: "2",
    name: "A la Prochaine",
    image:
      "https://imgs.search.brave.com/nsiGlyISticIptpic58hVto5HUTem6f76y5MqA_t5bE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYWls/ZWQtcmVkLXJ1YmJl/ci1zdGFtcC1vdmVy/LXdoaXRlLWJhY2tn/cm91bmQtODg0MTIz/MTQuanBn",
    remaining: 999999,
    active: true
  },
    {
    uniqueKey: "3",
    name: "Frying Pan",
    image: "/images/products/frying.png",
    remaining: 50,
    active: true,

  },
  {
    uniqueKey: "4",
    name: "Magnet Jadida 1",
    image: "/images/products/MAGNET JADIDA1.png",
    remaining: 50,
    active: true,

  },
  {
    uniqueKey: "5",
    name : "Magnet",
    image: "/images/products/MAGNET JADIDA3.png",
    remaining: 50,
    active: true,

  },
  {
    uniqueKey: "6",
    name : "Pince",
    image: "/images/products/pince.png",
    remaining: 20,
    active: true,
  },
  {
    uniqueKey: "7",
    name: "A la Prochaine",
    image: "https://imgs.search.brave.com/nsiGlyISticIptpic58hVto5HUTem6f76y5MqA_t5bE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYWls/ZWQtcmVkLXJ1YmJl/ci1zdGFtcC1vdmVy/LXdoaXRlLWJhY2tn/cm91bmQtODg0MTIz/MTQuanBn",
    remaining: 999999,
    active: true,

  } 
  , 
  {
    uniqueKey: "8",
    name : "Tablier",
    image: "/images/products/TABLIER_jadida.png",
    remaining: 30,
    active: true,

  }

];
