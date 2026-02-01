const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const multer = require("multer"); 
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

// ----- DATABASE CONNECTION -----
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "car_rental_db",
    port: 3306
});



db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// ----- HELPER: SYSTEM LOGGING -----
function addLog(action, message, type = 'info', ip = null, userAgent = null, status = 'success') {
    const query = "INSERT INTO system_logs (action, message, type, ip_address, user_agent, status) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [action, message, type, ip, userAgent, status], (err) => {
        if (err) console.error("Logging failed:", err);
    });
}

// 1. إعداد المخزن وتشفير الأسماء (Filename Encryption/Obfuscation)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/'); 
    },
    filename: (req, file, cb) => {
        // تشفير الاسم: بنستخدم تاريخ اللحظة مع رقم عشوائي ضخم عشان الاسم يكون مستحيل تخمينه
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // النتيجة هتكون مثلاً: car-1703856000-847293.jpg
        cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname)); 
    }
});

// 2. فلتر النوع (MIME Type & Extension Validation)
const fileFilter = (req, file, cb) => {
    // قائمة الامتدادات المسموحة
    const allowedExtensions = /jpeg|jpg|png|webp/;
    // فحص الامتداد (Extension)
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    // فحص النوع الحقيقي للملف (MIME Type) - ده اللي بيكشف لو ملف PHP متسمي JPG
    const mimetype = allowedExtensions.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // الملف سليم، ارفعه
    } else {
        // الملف مشبوه، ارفضه وارمي رسالة سيكيورتي
        cb(new Error("Security Alert: Only real images (JPG, PNG, WEBP) are allowed!"));
    }
};

// 3. تطبيق الإعدادات وتحديد الحجم (Size Limit)
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // تحديد الحجم: 2 ميجا بايت كحد أقصى (DoS Protection)
    }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});


// ... (Your other require statements)
const nodemailer = require('nodemailer');

// ----------------------------------------------------
// 📧 NODEMAILER SETUP 
// ----------------------------------------------------
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'thelastking398@gmail.com',
        pass: 'pfsv zgmz bjiv flgn' 
    }
});

// 1. Temporary store to save OTP codes
let otpStore = {}; 

// 2. Send OTP route
app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Email is required!" });

    // Generate a random 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code in memory for 5 minutes
    otpStore[email] = {
        otp: otp,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    const mailOptions = {
        from: '"Car Rental Verification" <mohamed80598@gmail.com>',
        to: email,
        subject: "Your Verification Code - Car Rental",
        html: `
            <div style="font-family: Arial; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #4a90e2;">Welcome to the Car Rental Service</h2>
                <p>Your verification code is:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
                <p>This code is valid for 5 minutes only.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("OTP Error:", error);
            return res.json({ success: false, message: "Failed to send the email." });
        }
        console.log("OTP Sent: " + otp); // For debugging in the terminal
        res.json({ success: true, message: "The verification code has been sent to your email." });
    });
});


app.post("/register", async (req, res) => {
   
    const { first_name, last_name, email, phone, password, otp, role } = req.body;

   
    if (!otpStore[email] || otpStore[email].otp !== otp) {
        return res.json({ success: false, message: "Invalid verification code or it has expired!" });
    }

    if (Date.now() > otpStore[email].expires) {
        delete otpStore[email];
        return res.json({ success: false, message: "The code has expired. Please request a new one." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        
        const query = `INSERT INTO users (first_name, last_name, email, phone, password_hash, user_type) VALUES (?, ?, ?, ?, ?, ?)`;

       
        db.query(query, [first_name, last_name, email, phone, hashedPassword, role], (err, result) => {
            if (err) {
                console.error("Registration Error:", err);
                return res.json({ success: false, message: "Registration failed or Email already exists!" });
            }

            
            delete otpStore[email];

           
            res.json({ 
                success: true, 
                message: "Registration completed successfully!",
                userId: result.insertId, 
                role: role             
            });
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.json({ success: false, message: "Server error." });
    }
});



app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip; // الحصول على الـ IP
    const userAgent = req.headers['user-agent']; // معلومات الجهاز

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            addLog("Login Attempt", `Non-existent email: ${email}`, "warning", ip, userAgent, "failed");
            return res.json({ success: false, message: "invalid Email or incorrect Password" });
        }

        const user = results[0];

        // 1. تشيك هل الحساب محظور حالياً؟
        if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
            addLog("Login Blocked", `User ${email} is locked out`, "danger", ip, userAgent, "blocked");
            return res.json({ success: false, message: "Account temporarily locked. Try again later." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            // 2. نجاح الدخول: صفر المحاولات الفاشلة
            db.query("UPDATE users SET failed_attempts = 0, lockout_until = NULL WHERE user_id = ?", [user.user_id]);
            addLog("Login Success", `User ${email} logged in`, "info", ip, userAgent, "success");

            res.json({
                success: true,
                user: {
                    id: user.user_id,
                    role: user.user_type,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone
                }
            });
        } else {
            // 3. فشل الدخول: زود عدد المحاولات
            let newAttempts = (user.failed_attempts || 0) + 1;
            let lockoutTime = null;

            if (newAttempts >= 5) {
                lockoutTime = new Date(Date.now() + 15 * 60000); // حظر 15 دقيقة
                addLog("Brute Force Alert", `User ${email} locked after 5 failed attempts`, "danger", ip, userAgent, "blocked");
            }

            db.query("UPDATE users SET failed_attempts = ?, lockout_until = ? WHERE user_id = ?", [newAttempts, lockoutTime, user.user_id]);
            addLog("Login Failure", `Wrong password for ${email}`, "warning", ip, userAgent, "failed");

            res.json({
                success: false,
                message: lockoutTime ? "Too many attempts. Account locked for 15 mins." : "invalid Email or incorrect Password"
            });
        }
    });
});


app.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    
    if (!otpStore[email] || otpStore[email].otp !== otp) {
        return res.json({ success: false, message: "Invalid or expired verification code!" });
    }

    
    if (Date.now() > otpStore[email].expires) {
        delete otpStore[email];
        return res.json({ success: false, message: "Code has expired." });
    }

    try {
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        const query = "UPDATE users SET password_hash = ? WHERE email = ?";
        db.query(query, [hashedPassword, email], (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Error updating database." });
            }
            
            
            delete otpStore[email];
            res.json({ success: true, message: "Password updated successfully!" });
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server error." });
    }
});
// 2. Public Car Routes
app.get("/cars/search", (req, res) => {
    const { location } = req.query; 
    let query = `
        SELECT car_id AS id, model AS name, price_per_day AS price, image_url AS image,
        seats, transmission, mileage_detail, fuel_type, location, status             
        FROM cars WHERE status = 'available'
    `;
    const values = [];
    if (location) {
        query += ` AND location = ?`;
        values.push(location);
    }
    db.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        
        const carsWithFeatures = results.map(car => ({
            id: car.id,
            name: car.name,
            price: parseFloat(car.price),
            image: car.image,
            features: [`${car.seats} Seats`, car.transmission, car.mileage_detail, car.fuel_type], 
            rating: 4.5, 
            reviews: 120,
            location: car.location 
        }));
        res.json({ success: true, cars: carsWithFeatures });
    });
});

app.get("/car/:id", (req, res) => {
    const query = `SELECT car_id AS id, model AS name, price_per_day AS price, image_url AS image, location, status FROM cars WHERE car_id = ?`;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        if (results.length > 0) {
            const car = results[0];
            car.price = parseFloat(car.price);
            res.json({ success: true, car: car });
        } else {
            res.status(404).json({ success: false, message: "Car not found." });
        }
    });
});

// 3. Booking Route (WITH DATE VALIDATION & PAYMENT)


function sendConfirmationEmail(bookingDetails) {
    const mailOptions = {
        from: '"DriveNow Rental" thelastking398@gmail.com ', 
        to: bookingDetails.email, 
       
        subject: `🚗 Booking Confirmed: #${bookingDetails.bookingId}`, 
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #7d72f1; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Reservation Confirmed!</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear Customer,</p>
                    <p>Thank you for choosing <b>DriveNow</b>. Your booking has been successfully processed and paid.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #7d72f1;">Booking Summary:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 5px 0;"><strong>Order ID:</strong></td><td>#${bookingDetails.bookingId}</td></tr>
                            <tr><td style="padding: 5px 0;"><strong>Start Date:</strong></td><td>${new Date(bookingDetails.start_date).toDateString()}</td></tr>
                            <tr><td style="padding: 5px 0;"><strong>End Date:</strong></td><td>${new Date(bookingDetails.end_date).toDateString()}</td></tr>
                            <tr><td style="padding: 5px 0;"><strong>Total Amount:</strong></td><td style="color: #2ecc71; font-weight: bold;">$${parseFloat(bookingDetails.totalPrice).toFixed(2)}</td></tr>
                        </table>
                    </div>

                    <p style="font-size: 14px; color: #666;">Please have your ID and License ready at the time of pick-up.</p>
                </div>
                <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #888;">
                    &copy; 2025 DriveNow Car Rental. All rights reserved.
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error sending confirmation email:', error);
        } else {
            console.log('✅ Confirmation Email sent:', info.response);
        }
    });
}
app.post("/booking", (req, res) => {
    console.log("Booking Request:", req.body);

    const {
        userId, car_id, start, end, location, 
        email, phone, nationalId,
        driverLicense, licenseExpiry, licenseCountry,
        terms, insurance, drivingRecord, totalPrice, paymentMethod
    } = req.body;

    
    if (!userId || !car_id || !start || !end || !email || !phone || !nationalId || !totalPrice || !paymentMethod) {
        return res.status(400).json({ success: false, message: "Missing information. Please log in again." });
    }

    const bookingQuery = `
        INSERT INTO bookings (
            car_id, user_id, start_date, end_date, location, total_price,
            email, phone, national_id,
            driver_license, license_expiry, license_country,
            terms_accepted, insurance_confirmed, driving_record_confirmed,
            booking_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    const bookingValues = [
        car_id, userId, start, end, location, totalPrice, 
        email, phone, nationalId,
        driverLicense, licenseExpiry, licenseCountry,
        terms ? 1 : 0, insurance ? 1 : 0, drivingRecord ? 1 : 0
    ];

    db.query(bookingQuery, bookingValues, (err, result) => {
        
        if (err) {
            console.error("❌ Booking DB Error:", err);
           
            return res.status(500).json({ 
                success: false, 
                message: "Database error: " + (err.sqlMessage || err.message) 
            });
        }

        const newBookingId = result.insertId;

        
        if (typeof addLog === 'function') {
            addLog('NEW_BOOKING', `Booking #${newBookingId} created by user ID ${userId}`, 'success');
        }

        // --- 4. INSERT PAYMENT ---
        const paymentQuery = `
            INSERT INTO payments (booking_id, amount, payment_method, payment_status)
            VALUES (?, ?, ?, ?)
        `;
        
        const paymentValues = [newBookingId, totalPrice, paymentMethod, 'completed']; 

        db.query(paymentQuery, paymentValues, (payErr, payResult) => {
            if (payErr) {
                console.error("❌ Payment Insert Error:", payErr);
                return res.json({ 
                    success: true, 
                    message: "Booking confirmed, but payment record failed.", 
                    bookingId: newBookingId 
                });
            }
            
            
            if (typeof sendConfirmationEmail === 'function') {
                sendConfirmationEmail({
                    bookingId: newBookingId,
                    email: email,
                    start_date: start,
                    end_date: end,
                    totalPrice: totalPrice
                });
            }

            
            res.json({ 
                success: true, 
                message: "Booking and Payment successful!", 
                bookingId: newBookingId 
            });
        });
    });
});
// ----- FETCH BOOKING DETAILS ROUTE (for Confirmation Page) -----
app.get("/booking-details/:bookingId", (req, res) => {
    const { bookingId } = req.params;

    const query = `
            SELECT b.booking_id, b.start_date, b.end_date, b.location, b.total_price, 
                c.model AS car_model, c.year AS car_year,
                u.first_name AS customer_first_name, u.last_name AS customer_last_name
            FROM bookings b
            JOIN cars c ON b.car_id = c.car_id
            JOIN users u ON b.user_id = u.user_id
            WHERE b.booking_id = ?
        `;

    db.query(query, [bookingId], (err, results) => {
        if (err) {
            console.error("Fetch Booking Details Error:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Database error while fetching booking details." 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        
        res.json({ 
            success: true, 
            bookingDetails: results[0] 
        });
    });
});


// 4. Owner Dashboard Routes
app.get("/owner/dashboard/:id", async (req, res) => {
    const ownerId = req.params.id;
    try {
        // 1. Get the owner's verification status
        const [[user]] = await db.promise().query(
            "SELECT is_verified FROM users WHERE user_id = ?", 
            [ownerId]
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "Owner not found" });
        }

        // 2. Get all cars owned by this user
        const [cars] = await db.promise().query(
            "SELECT * FROM cars WHERE owner_id = ?", 
            [ownerId]
        );

        // 3. Get all bookings for all cars owned by this user
        const [bookings] = await db.promise().query(`
            SELECT b.booking_id, b.start_date, b.end_date, b.total_price, b.booking_status,
                    c.model AS car_name, CONCAT(u.first_name, ' ', u.last_name) AS customer_name
            FROM bookings b
            JOIN cars c ON b.car_id = c.car_id
            JOIN users u ON b.user_id = u.user_id
            WHERE c.owner_id = ?
            ORDER BY b.created_at DESC
        `, [ownerId]);

        // 4. Calculate Dashboard Statistics
        // Earnings: Sum of total_price from confirmed or completed bookings
        const totalEarnings = bookings
            .filter(b => b.booking_status === 'completed' || b.booking_status === 'confirmed')
            .reduce((sum, b) => sum + parseFloat(b.total_price), 0);

        // Active Rentals: Count of currently 'confirmed' bookings
        const activeRentals = bookings.filter(b => b.booking_status === 'confirmed').length;

        // 5. Send complete data package to the frontend
        res.json({
            success: true,
            is_verified: user.is_verified, // Key for restricting "Add Car" functionality
            stats: { 
                totalCars: cars.length, 
                activeRentals: activeRentals, 
                earnings: totalEarnings 
            },
            cars: cars,
            bookings: bookings
        });

    } catch (err) {
        console.error("Owner dashboard error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error fetching dashboard data" 
        });
    }
});


// Add New Car (With File Upload)
// Add New Car (With Security Enhancements)
app.post("/cars", (req, res) => {
    // تشغيل الرفع وفحص الأمان (الحجم والنوع)
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // لو الملف حجمه أكبر من 2MB
            return res.status(400).json({ success: false, message: "File too large! Max size is 2MB." });
        } else if (err) {
            // لو الملف نوعه مش صورة (jpg/png/webp)
            return res.status(400).json({ success: false, message: err.message });
        }

        const { ownerId, model, brand, year, price, seats, features, location } = req.body;
        
        // التأكد إن فيه ملف ارفع فعلاً
        const imageUrl = req.file ? `/assets/${req.file.filename}` : '/assets/deals-1.png'; 
        const carLocation = location || 'Cairo';
        
        const query = `
            INSERT INTO cars (owner_id, model, year, price_per_day, seats, image_url, location, transmission, fuel_type, mileage_detail, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Automatic', 'Gasoline', '15 km/l', 'available')
        `;

        db.query(query, [ownerId, model, year, price, seats, imageUrl, carLocation], (dbErr, result) => {
            if (dbErr) {
                console.error(dbErr);
                return res.status(500).json({ success: false, message: "Database error adding car" });
            }

            // --- إضافة سجل أمني ---
            // بنسجل إن فيه عربية ارفعت ومن انهي IP وجهاز
            addLog(
                "Add Car", 
                `Owner ID ${ownerId} added a new car: ${brand} ${model}`, 
                "success", 
                req.ip, 
                req.headers['user-agent'], 
                "success"
            );

            res.json({ success: true, message: "Car added successfully with security check" });
        });
    });
});

app.delete("/cars/:id", (req, res) => {
    db.query("DELETE FROM cars WHERE car_id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, message: "Car deleted" });
    });
});

app.put("/bookings/:id/status", (req, res) => {
    const { status } = req.body;
    db.query("UPDATE bookings SET booking_status = ? WHERE booking_id = ?", [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, message: "Status updated" });
    });
});








//================================= ADMIN ROUTES =====================//


// ----- ADMIN: USER & OWNER MANAGEMENT -----
app.get("/admin/users", (req, res) => {
    db.query("SELECT user_id, first_name, last_name, email, phone, user_type, is_verified, created_at FROM users ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, users: results });
    });
});

app.post("/admin/manage-verification", (req, res) => {
    const { userId, action } = req.body;
    const status = action === 'verify' ? 1 : 0;
    db.query("UPDATE users SET is_verified = ? WHERE user_id = ?", [status, userId], (err) => {
        if (err) return res.status(500).json({ success: false });
        addLog('VERIFICATION_CHANGE', `User ID ${userId} status set to ${action}`, action === 'verify' ? 'success' : 'warning');
        res.json({ success: true, message: `Owner ${action}ed.` });
    });
});

app.post("/admin/approve-owner", (req, res) => {
    const { userId, action } = req.body;
    if (action === 'approve') {
        db.query("UPDATE users SET is_verified = 1 WHERE user_id = ?", [userId], () => {
            addLog('OWNER_APPROVED', `Owner ID ${userId} approved`, 'success');
            res.json({ success: true });
        });
    } else {
        // This acts as the "Reject" if you ever use the dashboard button
        db.query("DELETE FROM users WHERE user_id = ?", [userId], () => {
            addLog('OWNER_REJECTED', `Owner ID ${userId} deleted`, 'danger');
            res.json({ success: true });
        });
    }
});

// ----- ADMIN: CAR MANAGEMENT -----
app.get("/admin/cars", (req, res) => {
    const query = `SELECT c.car_id, c.model, c.year, c.price_per_day, c.status, c.image_url, c.location, CONCAT(u.first_name, ' ', u.last_name) AS owner_name FROM cars c JOIN users u ON c.owner_id = u.user_id`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, cars: results });
    });
});

app.post("/admin/delete-car", (req, res) => {
    const { carId } = req.body;
    db.query("DELETE FROM cars WHERE car_id = ?", [carId], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Delete failed (Linked data)" });
        addLog('CAR_DELETED', `Car ID #${carId} removed by admin`, 'danger');
        res.json({ success: true, message: "Car removed." });
    });
});

// ----- ADMIN: DASHBOARD & LOGS -----
app.get("/admin/stats", (req, res) => {
    const q = {
        u: "SELECT COUNT(*) as count FROM users",
        c: "SELECT COUNT(*) as count FROM cars",
        e: "SELECT SUM(total_price) as total FROM bookings"
    };
    db.query(q.u, (err, u) => {
        db.query(q.c, (err, c) => {
            db.query(q.e, (err, e) => {
                res.json({ success: true, stats: { users: u[0].count, cars: c[0].count, earnings: e[0].total || 0 }});
            });
        });
    });
});

app.get("/admin/pending-approvals", (req, res) => {
    db.query("SELECT * FROM users WHERE user_type = 'owner' AND is_verified = 0", (err, results) => {
        res.json({ success: true, pending: results || [] });
    });
});

// --- ADMIN: GET SYSTEM LOGS ---
// --- ADMIN: GET SYSTEM LOGS (Cybersecurity Version) ---
app.get("/admin/logs", (req, res) => {
    // إحنا بنجيب كل الأعمدة (*) عشان نعرض الـ IP والـ User Agent وحالة العملية
    const query = "SELECT * FROM system_logs ORDER BY time DESC LIMIT 50";

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, logs: [] });
        }
        // إرسال السجلات كاملة للفرونت إند
        res.json({ success: true, logs: results });
    });
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`           Car Rental System     `);
  console.log(`   Running on  `);
   console.log(`          http://localhost:${PORT} `);
  console.log(`========================================`);
});