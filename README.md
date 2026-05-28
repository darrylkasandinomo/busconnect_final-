# BusConnect

> **Suriname's #1 School Bus Platform** — A web application that connects parents and school bus drivers in a safe, transparent, and organized way.

---

## The Team — The Element 3

| Student No. | Name | Role |
|---|---|---|
| 254011 | Ngaisa Basedie | Registration, profile & login page |
| 254012 | Shriyanie Debi-tewari | Admin panel & system management |
| 256015 | Darryl Kasandinomo | UI & Navigation |
| 255024 | Adney Dayen | Database, SQL & notifications |
| 256020 | Shemar Dipotaroeno | GPS, live tracker & locations |

**School:** UNASAT — Paramaribo, Suriname
**Version:** 1.0 | **Date:** April 29, 2026

---

## About the Project

### The Problem
Parents in Suriname find school bus drivers through Facebook groups or word of mouth. There is no central, reliable place. Information about routes, experience, and availability is difficult to verify.

### The Solution
BusConnect is a web application where drivers can register with a profile, and parents can search, filter, and directly contact available drivers. A key feature is a **live GPS tracker** so parents can follow the school bus in real-time via Google Maps.

### Goal
A reliable, central platform for school bus transport in Suriname — transparent, user-friendly, and accessible to both parents and drivers.

---

## Technologies

| Layer | Technology | Version |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) | — |
| Backend | Node.js + Express.js | ^5.2 |
| Database | MySQL | 8.x |
| Real-time | Socket.IO | ^4.7 |
| Authentication | JSON Web Tokens (JWT) | ^9.0 |
| Email | Mailtrap | ^4.6 |
| Maps / GPS | Google Maps JavaScript API | — |
| Environment | dotenv | ^17 |

---

## Requirements

Make sure the following software is installed **before** starting the project:

| Software | Minimum version | Download |
|---|---|---|
| Node.js | 18 LTS or higher | [nodejs.org](https://nodejs.org) |
| npm | included with Node.js | — |
| MySQL | 8.0 or higher | [mysql.com](https://dev.mysql.com/downloads/) |
| Git | 2.x | [git-scm.com](https://git-scm.com) |
| VS Code | Recommended editor | [code.visualstudio.com](https://code.visualstudio.com) |

> **Tip:** Verify your versions with `node -v`, `npm -v`, and `mysql --version` in the terminal.

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/<username>/busconnect.git
cd busconnect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
# Copy the example file and fill in your own values
cp .env.example .env
```

Open `.env` and fill in your database credentials, Mailtrap token, and Google Maps API key.

### 4. Set up the database

The server automatically creates the required tables on first startup. Just make sure your MySQL server is running and the database exists:

```sql
CREATE DATABASE IF NOT EXISTS busconnect;
```

### 5. Start the server
```bash
node server.js
```

Open your browser at `http://localhost:3000`

---

## Usage

### As a Parent
1. Go to `http://localhost:3000` in your browser.
2. Browse available drivers on the **home page** — no account required.
3. Filter by school, neighborhood, or availability using the search bar.
4. Click a driver profile to view contact details and route information.
5. Track the school bus live via the **GPS tab** once the driver is active.

### As a Driver
1. Click **Register** and create an account with your license information.
2. Upload a profile photo and fill in your route and work experience.
3. Enable GPS access in your browser to be tracked live.
4. Receive requests from parents via email and confirm through the platform.

### As an Admin
1. Navigate to `/admin` and log in with the admin credentials.
2. Manage drivers via the **Admin Panel** (create, view, edit, delete).
3. Send notifications to drivers and monitor the live tracker.
4. Automatically receive an email for every new driver registration.

---

## Task Breakdown

### Ngaisa Basedie — Registration & Profile
| # | Task |
|---|---|
| 1 | Drivers can register via a sign-in page |
| 2 | Mandatory profile photo upload during registration |
| 3 | Drivers can enter and update personal information |
| 4 | Contact info visible to parents |
| 5 | Add route, work experience, and license information |
| 6 | Drivers can delete their profile |

---

### Shriyanie Debi-tewari — Admin & System Management
| # | Task |
|---|---|
| 1 | Admin login page |
| 2 | Manage drivers (CRUD: create, view, edit, delete) |
| 3 | Admin receives an email for every new registration |
| 4 | Drivers can be deleted or blocked |
| 5 | Maintain overview and manage the database |
| 6 | Manage routes and trips |
| 7 | Send notifications to drivers |

---

### Darryl Kasandinomo — UI & Navigation
| # | Task |
|---|---|
| 1 | Tabs and navigation — Home / About / Contact / FAQ / Register |
| 2 | User-friendly design for both parents and drivers |
| 3 | Parents can view drivers without an account |
| 4 | Admin can verify parent information |
| 5 | Dark mode / Light mode toggle |
| 6 | Responsive design — mobile and desktop |
| 7 | Scroll-reveal animations per section |
| 8 | FAQ accordion |

---

### Adney Dayen — Database, SQL & Notifications
| # | Task |
|---|---|
| 1 | Set up and manage MySQL database |
| 2 | Securely store driver and parent data in the correct tables |
| 3 | Maintain SQL tables |
| 4 | Drivers receive requests from parents |
| 5 | Subscription confirmation via email |
| 6 | Parents receive a notification when the bus has arrived |
| 7 | Request confirmation via email for parents |

---

### Shemar Dipotaroeno — GPS & Live Tracker
| # | Task |
|---|---|
| 1 | Implement GPS / live tracker |
| 2 | Driver can enable location access |
| 3 | Parents can view the live location of the school bus |
| 4 | Parents can search/filter by route or location |
| 5 | Admin can monitor the live tracker |
| 6 | Admin can view locations |
| 7 | Accessible on mobile and desktop |

---

## GitHub Workflow (branches)

Each team member works on their **own branch** and submits a Pull Request so the team leader can merge into `main`.

```bash
# Create your branch (once)
git checkout -b your-name

# Save and push changes
git add .
git commit -m "feat: short description of what you did"
git push origin your-name
```

### Branch overview
| Branch | Owner |
|---|---|
| `main` | Team leader — via Pull Request only |
| `ngaisa-basedie` | Registration & Profile |
| `shriyanie-debi-tewari` | Admin & Management |
| `darryl-kasandinomo` | UI & Navigation |
| `adney-dayen` | Database & Notifications |
| `shemar-dipotaroeno` | GPS & Tracker |

---

## File Structure

```
busconnect/
├── index.html          # Main page (SPA)
├── main.css            # All styles
├── main.js             # Navigation, dark mode, FAQ, forms
├── server.js           # Node.js backend (Express + Socket.IO)
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── config/
│   └── db.js           # MySQL connection pool
├── routes/
│   ├── auth.js         # JWT authentication endpoints
│   ├── drivers.js      # Driver registration & listing (SQL)
│   ├── contact.js      # Contact form (SQL)
│   └── tracker.js      # Bus route history (SQL)
├── middlewares/
│   ├── auth.js         # JWT verification middleware
│   └── validate.js     # Request body validation
├── img/
│   ├── bus.png         # Bus icon
│   ├── buslogo.png     # App logo
│   └── buslogo.svg     # App logo (SVG)
└── README.md           # This file
```

---

## Functional Requirements — Summary

### General
- User-friendly on both mobile and desktop
- All team members have Node.js, VS Code, Git, and MySQL installed

### For Drivers
- Register, create a profile, upload a photo
- Add route and work experience
- Enable GPS for live tracking

### For Parents
- View drivers without an account
- Filter by school, neighborhood, and availability
- Follow the live location of the bus
- Contact drivers and receive confirmation

### For the Admin
- Log in and manage users (CRUD)
- Send notifications, manage routes
- Monitor the live tracker

---

## Sources

- [GFC News Suriname — School Transport](https://www.gfcnieuws.com/schoolvervoer-blijft-een-bron-van-zorgen-in-suriname/)
- [UNASAT](https://unasat.ngineerlab.com/)
- [MorningBus](https://morningbus.com/)
- [BusWhere](https://www.buswhere.com/)
- [BusBuddy](https://busbuddy.net/)
- [W3Schools](https://www.w3schools.com)

---

*© 2026 BusConnect — The Element 3 · UNASAT · Paramaribo, Suriname*
