# 🚗 DriveNow - Professional Car Rental System

## 📝 Project Description
**DriveNow** is a comprehensive Full-Stack Car Rental Management System designed to connect car owners with customers. The platform provides a seamless experience for browsing, booking, and managing vehicle rentals, featuring a dedicated Admin panel for system oversight and an Owner panel for fleet management.

---

## 🔑 Admin Demo Credentials
To explore the administrative features, use the following credentials:
* **Email:** `admin@carrental.com`
* **Password:** `admin123`

---

## 🌟 Professional Key Features

### 1. Advanced Authentication & Security
* **Email Verification (OTP):** During registration, the system sends an **OTP (One-Time Password)** to the user's email to verify identity before account activation.
* **Password Recovery:** A full **"Forgot Password"** workflow where users can securely reset their passwords. The system securely updates the database with the newly hashed password.
* **Secure Data:** All passwords are encrypted using `bcryptjs` to ensure maximum security.

### 2. User Roles & Specialized Panels
* **👑 Admin Dashboard:** The central brain of the system.
    * Full control over all users and vehicles.
    * **Approval System:** Owners cannot list cars until the Admin manually reviews and approves their account.
    * **System Monitoring:** Tracks detailed system logs and real-time business statistics (Earnings, User Count, Active Cars).
* **🚘 Owner Panel:**
    * Owners can upload their cars, set daily rental prices, and provide vehicle specifications.
    * Track booking requests specifically for their fleet.
* **👤 Customer Experience:**
    * Advanced search by location and date.
    * **Automated Notifications:** Once a booking is marked as **"Completed"**, the system automatically sends a professional confirmation email to the customer's inbox.

### 3. Core Functionalities
* **Real-time Booking:** Dynamic price calculation based on rental duration.
* **Interactive UI:** Modern dark/purple theme using CSS variables, fully responsive for Mobile, Tablet, and Desktop.
* **System Auditing:** Admin can track every action (Logs) for security and transparency.

---

## 📊 Database Architecture
The project uses **MySQL** with a highly structured schema to handle complex relationships:
* **Users Table:** Stores roles (Admin, Owner, Customer) and verification status.
* **Cars Table:** Manages vehicle specs, location, and ownership.
* **Bookings Table:** Links customers to cars with status tracking (Pending, Confirmed, Completed).
* **System Logs:** For auditing every administrative and user action.

---

## 🛠 Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Remix Icons.
* **Backend:** Node.js, Express.js.
* **Communication:** **Nodemailer** (SMTP Integration for OTP & Booking Alerts).
* **Database:** MySQL.
* **Libraries:** `mysql2`, `bcryptjs`, `cors`, `multer`, `dotenv`.

---

## 🚀 How to Run
1.  **Clone the project:** `git clone https://github.com/mohamed-saied-1/Car-Rental-Online.git`
2.  **Install Dependencies:** `npm install`
3.  **Database:** Import `car_rental_db.sql` to your MySQL server.
4.  **Environment Variables:** Create a `.env` file and add your `EMAIL_USER` and `EMAIL_PASS`.
5.  **Start Server:** `node server.js`
6.  **URL:** Open and click [http://localhost:3000](http://localhost:3000)

---
**DriveNow Mobility Solutions © 2025. All rights reserved.**
*Built with passion for the automotive and tech industry.*
