# 🚗 DriveNow - Full-Stack Car Rental 



## 📝 Project Overview

**DriveNow** is a sophisticated, end-to-end Car Rental Management platform built to bridge the gap between vehicle owners and customers. Designed with a modern user experience in mind, the system provides a seamless workflow for car listing, discovery, and automated booking management. 



The project demonstrates a robust **Full-Stack architecture**, integrating a responsive frontend with a secure Node.js backend and a relational MySQL database to handle complex business logic and high-integrity data transactions.



---



## 🌟 Key Features



### 1. User Roles & Specialized Panels

The platform is divided into three specialized environments tailored to different user needs:

* **👑 Admin Dashboard (The System Brain):** * **Full Control:** 

    * **Full Oversight:** Manage users, verify owners, and monitor system-wide statistics.
    * **Manual Approval:** Owners are restricted from listing cars until an Admin reviews and approves their credentials.
    * **System Auditing:** Access to full system logs for transparency and security analysis.

* **🚘 Owner Management Suite:**

   * **Fleet Management:** Owners can upload their vehicles, set daily rental prices, and provide detailed specifications.
    * **Request Tracking:** Specialized dashboard to monitor and manage booking requests for their specific fleet.

* **👤 Customer Experience:**

    * * **Advanced Search:** Find the perfect car by filtering locations and dates.
    * **Automated Notifications:** Once a booking is marked as "Completed", the system automatically sends a professional confirmation email to the customer's inbox.



### 2. Core Functionalities

* **Real-time Booking:** Dynamic price calculation logic based on rental duration and vehicle rates.

* **Interactive UI:** A sleek, modern dark/purple theme built using CSS variables, fully responsive for Mobile, Tablet, and Desktop.

* **System Auditing:** Integrated administrative tracking (Logs) for every action to ensure total transparency and security.



### 3. Enterprise-Grade Security

### 1. Identity & Access Management (MFA/2FA)
* **Email Verification (OTP):** Integrated **Multi-Factor Authentication**. During registration, a unique 6-digit OTP is sent via **Nodemailer** to verify the user's identity before account activation.
* **Secure Password Recovery:** A robust "Forgot Password" workflow using OTP verification to prevent unauthorized account takeovers.

### 2. Data Protection & Cryptography
* **Bcryptjs Hashing:** Passwords are never stored in plain text. We utilize salted hashing with a high cost factor to protect against **Rainbow Table** and **Brute Force** attacks.
* **Role-Based Access Control (RBAC):** Strict server-side validation ensures that users can only access data and endpoints authorized for their specific role (Admin, Owner, or Customer).

### 3. Advanced File Upload Security (Malware Defense)
To prevent **Remote Code Execution (RCE)** and malicious script injections:
* **MIME-Type Validation:** The server strictly filters uploads to allow only specific image formats (`JPEG`, `PNG`, `WEBP`).
* **Filename Sanitization:** Files are automatically renamed using cryptographic timestamps to prevent **Directory Traversal** attacks.
* **Size Limitation:** A strict **2MB limit** is enforced to mitigate **Denial of Service (DoS)** attempts.

### 4. Forensic Logging & Monitoring
* **Audit Trail:** The system captures a detailed log of every critical action, including **IP Addresses**, **User Agents (Device Info)**, and timestamps.
* **Security Dashboard:** Admins can monitor system logs in real-time to detect and identify suspicious patterns or attack types.



---



## 📊 Database Architecture (MySQL)

The project utilizes a highly structured relational schema to handle complex data relationships:

* **Users Table:** Stores roles (Admin, Owner, Customer), encrypted credentials, and verification status.

* **Cars Table:** Manages vehicle specifications, locations, and owner associations.

* **Bookings Table:** Tracks the lifecycle of a rental (Pending, Confirmed, Completed) linking customers to cars.

* **System Logs:** Dedicated auditing table for tracking administrative and user security actions.



---



## 🛠 Tech Stack

* **Frontend:** HTML5, Modern CSS3, Vanilla JavaScript.

* **Backend:** Node.js with Express.js framework.

* **Database:** MySQL (Relational Schema).

* **Communication:** Nodemailer (SMTP Integration for OTP & Booking Alerts).

* **Libraries:** mysql2, bcryptjs, multer, dotenv, cors.



---



## 🚀 Installation & Setup



1.  **Clone the Repository:**

    ```bash

    git clone [https://github.com/mohamed-saied-1/Car-Rental-Online.git](https://github.com/mohamed-saied-1/Car-Rental-Online.git)

    ```

2.  **Environment Configuration:**

    * Install dependencies: `npm install`

    * Create a `.env` file and add your `DB_PASS`, `EMAIL_USER`, and `EMAIL_PASS`.

3.  **Database Deployment:**

    * Import the provided `car_rental_db.sql` into your MySQL server.

4.  **Launch the System:**

    ```bash

    node server.js

    ```

    Access the application at `http://localhost:3000`.



---



## 🔑 Admin Demo Credentials

Explore the administrative features with:

* **Email:** `admin@carrental.com`

* **Password:** `admin123`

---

**DriveNow Mobility Solutions © 2025. All rights reserved.**

*Built with passion for the automotive and tech industry.*

