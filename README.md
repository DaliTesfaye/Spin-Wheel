# 🎡 Jeu de Roue (Spin Wheel Game)

A simple, offline-first spin wheel game built for tablets. Users spin a wheel to win products, with all data stored locally using IndexedDB.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Database Schema](#database-schema)

---

## ✨ Features

### 🎮 Game Features
- **Interactive Spin Wheel** - Visual wheel with product images and names
- **Smart Selection** - Only selects products that are still available
- **Locked Products Display** - Shows finished products with lock icon (🔒) and grayed out
- **Remaining Count** - Shows quantity left for each product
- **Winner Modal** - Celebratory popup when you win a product
- **Spin Animation** - Smooth 3-second rotation with random degrees

### 🔧 Admin Features
- **Product Management** - Add, edit, and delete products
- **Quantity Control** - Set remaining quantities manually
- **Active/Inactive Toggle** - Enable or disable products on the wheel
- **Reset Quantities** - Reset all products to default quantity (10)
- **Spin History** - View all past spins with date and time
- **Clear History** - Remove all spin logs

### 💾 Offline-First
- **No Server Required** - Everything runs in the browser
- **IndexedDB Storage** - All data stored locally on device
- **No Internet Needed** - Works completely offline

---

## 🛠 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Dexie.js** - IndexedDB wrapper (local database)
- **React Router DOM** - Client-side routing

---

## 📁 Project Structure

```
jeu-de-roue/
├── src/
│   ├── types.ts              # TypeScript interfaces (Product, SpinLog, Setting)
│   ├── db.ts                 # IndexedDB setup with Dexie
│   ├── spin.ts               # Game logic (spin wheel, get products)
│   ├── pages/
│   │   ├── Game.tsx          # Main spin wheel page
│   │   └── Admin.tsx         # Admin panel for management
│   ├── App.tsx               # Routing setup
│   ├── index.css             # Tailwind imports
│   └── main.tsx              # App entry point
├── public/                   # Static assets
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jeu-de-roue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Or the URL shown in terminal

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📖 Usage

### First Time Setup

1. **Navigate to Admin Panel**
   - Click "⚙️ Admin" button on the game page
   - Or go to `/admin` route

2. **Add Products**
   - Click "➕ Add Product" button
   - Fill in:
     - **Product Name** (e.g., "iPhone 15")
     - **Image URL** (link to product image)
     - **Remaining Quantity** (how many to give away)
     - **Active** (checkbox to show on wheel)
   - Click "Add Product"

3. **Start Playing**
   - Go back to main page (`/`)
   - Click "🎲 SPIN NOW!" button
   - Watch the wheel spin and win prizes!

### Managing Products

**Edit a Product:**
- In Admin Panel, click "Edit" on any product card
- Modify fields and click "Update Product"

**Delete a Product:**
- Click "Delete" button on product card
- Confirm deletion

**Reset Quantities:**
- Click "🔄 Reset Quantities" button
- All products will be reset to 10 remaining

**View Spin History:**
- Click "📊 Spin History" tab in Admin Panel
- See all wins with date and time

**Clear History:**
- Click "🗑️ Clear History" button in Spin History tab

---

## 🔍 How It Works

### Architecture Overview

```
┌─────────────┐
│   Browser   │
└─────────────┘
      │
      ├── React App (UI)
      │   ├── Game.tsx (Spin Wheel)
      │   └── Admin.tsx (Management)
      │
      ├── Business Logic
      │   └── spin.ts (Game rules)
      │
      └── Local Storage
          └── IndexedDB (Dexie.js)
              ├── products table
              ├── logs table
              └── settings table
```

### File Breakdown

#### **1. types.ts** - Data Models
Defines TypeScript interfaces for:
- `Product` - Product information (name, image, quantity, active status)
- `SpinLog` - Spin history records (product, date, time)
- `Setting` - App settings (for future use)

#### **2. db.ts** - Database Setup
- Creates IndexedDB database named "SpinWheelDB"
- Defines 3 tables: products, logs, settings
- Uses Dexie.js for easier database operations
- Exports single `db` instance used throughout app

#### **3. spin.ts** - Game Logic
- `getAllActiveProducts()` - Gets all active products (including finished)
- `getActiveProducts()` - Gets only products with remaining > 0
- `spinWheel()` - Main logic:
  1. Gets available products
  2. Randomly selects one
  3. Decreases quantity
  4. Logs the win
  5. Returns winner

#### **4. pages/Game.tsx** - Main Game UI
**State:**
- `spinning` - Is wheel currently spinning?
- `winner` - Product that was won (if any)
- `showTryAgain` - Show "try again" message?
- `activeProducts` - All active products for display
- `rotation` - Current wheel rotation in degrees

**Key Functions:**
- `loadProducts()` - Fetches products from database
- `handleSpin()` - Triggers spin animation and logic

**UI Components:**
- Header with title and admin link
- Wheel with colored segments and product labels
- Spin button (disabled when no prizes left)
- Winner modal (celebration popup)
- Try again modal (for finished products)

#### **5. pages/Admin.tsx** - Admin Panel
**State:**
- `products` - All products
- `logs` - Spin history
- `editingProduct` - Currently editing product (if any)
- `showAddForm` - Show add/edit form?
- `activeTab` - Current tab (products or logs)
- `formData` - Form input values

**Key Functions:**
- `loadProducts()` / `loadLogs()` - Fetch data
- `handleSubmit()` - Add or update product
- `handleEdit()` - Load product into form
- `handleDelete()` - Remove product
- `handleResetQuantities()` - Reset all to 10
- `handleClearLogs()` - Clear history

**UI Components:**
- Header with back button
- Tab navigation (Products / Spin History)
- Add/Edit form
- Product grid with cards
- History table

#### **6. App.tsx** - Routing
- Sets up React Router
- Defines two routes:
  - `/` - Game page
  - `/admin` - Admin panel

---

## 🗄 Database Schema

### IndexedDB: `SpinWheelDB`

#### **products** table
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment primary key |
| name | string | Product name |
| image | string | Product image URL |
| remaining | number | Quantity left |
| active | boolean | Show on wheel? |

**Indexes:** `++id, name, active, remaining`

#### **logs** table
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment primary key |
| productId | number | Reference to product |
| productName | string | Product name (for history) |
| date | Date | When it was won |

**Indexes:** `++id, productId, date`

#### **settings** table
| Field | Type | Description |
|-------|------|-------------|
| key | string | Setting name (primary key) |
| value | string | Setting value |

**Indexes:** `key`

---

## 🎯 Key Behaviors

### Spin Logic
1. User clicks "SPIN NOW!"
2. Wheel rotates 4-6 full spins (random)
3. After 3 seconds, spin logic executes:
   - Filters products with `remaining > 0`
   - Randomly selects one
   - Decreases quantity by 1
   - Logs the win
4. Shows winner modal

### Product Display on Wheel
- **Active + Remaining > 0** - Normal display (colorful)
- **Active + Remaining = 0** - Grayed out with 🔒 lock icon
- **Inactive** - Not shown on wheel at all

### Automatic Quantity Management
- Each win automatically decreases remaining by 1
- When remaining reaches 0:
  - Product stays visible but locked
  - Cannot be selected by spin
  - Admin can reset quantity anytime

---

## 🎨 Styling

### Tailwind CSS Classes Used
- **Gradients:** `bg-gradient-to-r`, `bg-gradient-to-br`
- **Animations:** `animate-spin`, `animate-bounce`, `animate-pulse`
- **Transitions:** `transition-all duration-300`
- **Shadows:** `shadow-xl`, `drop-shadow-2xl`
- **Backdrop:** `backdrop-blur-md`
- **Responsive:** `md:` prefix for medium screens+

### Color Scheme
- **Primary:** Purple 600, Pink 600
- **Wheel Segments:** 8 vibrant colors
- **Success:** Green 500
- **Warning:** Orange 500
- **Error:** Red 500

---

## 🔮 Future Enhancements (Not Yet Implemented)

- **PWA Support** - Install as app, work offline
- **Settings Table Usage** - Daily reset time, max spins per day
- **User Authentication** - Track individual users
- **Statistics** - Analytics dashboard
- **Sound Effects** - Spin sounds and win celebration
- **Custom Wheel Colors** - Admin can choose colors
- **Export Data** - Export history as CSV/JSON
- **Backup/Restore** - Save/load database

---

## 🐛 Troubleshooting

### Database Issues
**Problem:** Data not persisting
- **Solution:** Check browser IndexedDB support and storage permissions

**Problem:** "Database version change" error
- **Solution:** Clear IndexedDB in browser dev tools → Application → IndexedDB

### Build Issues
**Problem:** Tailwind classes not working
- **Solution:** Ensure `postcss.config.js` and `tailwind.config.js` exist

**Problem:** Type errors
- **Solution:** Run `npm install` to ensure all type definitions are installed

---

## 📝 License

This project is for internal company use only.

---

## 👥 Contributing

For improvements or bug fixes:
1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit for review

---

## 📞 Support

For questions or issues, contact the development team.

---

**Built for Guerilla Com**

