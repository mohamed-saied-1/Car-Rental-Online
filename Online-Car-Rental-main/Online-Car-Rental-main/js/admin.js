document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        alert("Access Denied");
        window.location.href = '/html/login.html';
        return;
    }

    // 2. Initialize
    loadDashboard();
    setupNavigation();
    setupMobileMenu();
});

function setupNavigation() {
    document.querySelectorAll('.menu a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            
            if (page === 'dashboard') loadDashboard();
            else if (page === 'users') loadUsers('customer'); // Default to customer
            else if (page === 'owners') loadUsers('owner');   // Added for owners
            else if (page === 'cars') loadCars();
            else if (page === 'bookings') loadBookings();
            else if (page === 'logs') loadLogs();             // Added for Logs
            else renderPlaceholder(page);
        });
    });
}

async function loadUsers() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<h2>Loading Users...</h2>';

    try {
        const res = await fetch('http://localhost:3000/admin/users');
        const data = await res.json();

        content.innerHTML = `
            <h1 class="page-title">User Management</h1>
            <div class="table-section">
                <table style="width:100%; border-collapse: collapse; background:#fff;">
                    <thead>
                        <tr style="background:#f4f4f4; text-align:left;">
                            <th style="padding:12px;">Name</th>
                            <th style="padding:12px;">Email</th>
                            <th style="padding:12px;">Role</th>
                            <th style="padding:12px;">Status</th>
                            <th style="padding:12px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.users.map(u => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding:12px;">${u.first_name} ${u.last_name}</td>
                                <td style="padding:12px;">${u.email}</td>
                                <td style="padding:12px;"><span class="badge ${u.user_type}">${u.user_type}</span></td>
                                <td style="padding:12px;">${u.is_verified ? '✅ Verified' : '❌ Unverified'}</td>
                                <td style="padding:12px;">
                                    <button onclick="deleteUser(${u.user_id})" style="color:red; border:none; background:none; cursor:pointer;">
                                        <i class="ri-delete-bin-line"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        content.innerHTML = '<p>Error loading users.</p>';
    }
}

window.deleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
        await fetch('http://localhost:3000/admin/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        loadUsers();
    }
};

// --- VIEW: SYSTEM LOGS ---
async function loadLogs() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Fetching System Audit Logs...</div>';

    try {
        const res = await fetch('http://localhost:3000/admin/logs');
        const data = await res.json();

        content.innerHTML = `
            <h1 class="page-title">System Audit Logs</h1>
            <div class="table-section">
                <table class="logs-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Description</th>
                            <th>Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.logs.map(log => {
                            const typeMap = {
                                'info': { color: '#3498db', icon: 'ri-information-line' },
                                'success': { color: '#2ecc71', icon: 'ri-checkbox-circle-line' },
                                'warning': { color: '#f1c40f', icon: 'ri-error-warning-line' },
                                'danger': { color: '#e74c3c', icon: 'ri-alert-line' }
                            };
                            const theme = typeMap[log.type] || typeMap['info'];

                            return `
                                <tr style="border-left: 4px solid ${theme.color};">
                                    <td style="white-space: nowrap; color: #666;">
                                        ${new Date(log.time).toLocaleString()}
                                    </td>
                                    <td><strong>${log.action.toUpperCase()}</strong></td>
                                    <td>${log.message}</td>
                                    <td>
                                        <span style="color: ${theme.color}; font-weight: bold; font-size: 0.8rem;">
                                            <i class="${theme.icon}"></i> ${log.type.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<p class="error">Failed to load system logs.</p>';
    }
}

// --- VIEW: DASHBOARD ---
async function loadDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Loading Dashboard...</div>';

    try {
        // 1. Fetch data in parallel for better performance
        const [statsRes, pendingRes, logsRes] = await Promise.all([
            fetch('http://localhost:3000/admin/stats'),
            fetch('http://localhost:3000/admin/pending-approvals'),
            fetch('http://localhost:3000/admin/logs')
        ]);

        const statsData = await statsRes.json();
        const pendingData = await pendingRes.json();
        const logsData = await logsRes.json();
        // Ensure logs exists even if the server returns an error
        const logs = (logsData && logsData.logs) ? logsData.logs : [];

        // 2. Render Dashboard HTML
        content.innerHTML = `
            <h1 class="page-title">Admin Dashboard</h1>
            
            <div class="dashboard-cards">
                <div class="card-box">
                    <div class="icon" style="background: rgba(52, 152, 219, 0.1); color: #3498db;"><i class="ri-user-3-fill"></i></div>
                    <h3>${statsData.stats.users}</h3>
                    <p>Total Users</p>
                </div>
                <div class="card-box">
                    <div class="icon" style="background: rgba(241, 196, 15, 0.1); color: #f1c40f;"><i class="ri-id-card-fill"></i></div>
                    <h3>${pendingData.pending.length}</h3>
                    <p>Pending Approvals</p>
                </div>
                <div class="card-box">
                    <div class="icon" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71;"><i class="ri-car-fill"></i></div>
                    <h3>${statsData.stats.cars}</h3>
                    <p>Total Cars</p>
                </div>
                <div class="card-box">
                    <div class="icon" style="background: rgba(155, 89, 182, 0.1); color: #9b59b2;"><i class="ri-money-dollar-circle-fill"></i></div>
                    <h3>$${statsData.stats.earnings}</h3>
                    <p>Total Earnings</p>
                </div>
            </div>

            <div class="dashboard-grid" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-top: 20px;">
                
                <div class="table-section">
                    <h3 class="section-title"><i class="ri-time-line"></i> Pending Owner Approvals</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingData.pending.length > 0 ? pendingData.pending.map(u => `
                                <tr>
                                    <td>${u.first_name} ${u.last_name}</td>
                                    <td>${u.email}</td>
                                    <td>
                                        <button class="btn btn-success btn-sm" onclick="handleOwner('${u.user_id}', 'approve')">
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="3" style="text-align:center; padding: 20px; color: #888;">No pending approvals found.</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="table-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 class="section-title" style="margin: 0;"><i class="ri-terminal-box-line"></i> System Logs</h3>
                        <a href="#" onclick="loadLogs()" style="font-size: 0.8rem; color: var(--primary-color);">View All</a>
                    </div>
                    <div class="logs-feed">
                        ${logs.length > 0 ? logsData.logs.slice(0, 8).map(log => {
                            const color = log.type === 'danger' ? '#e74c3c' : (log.type === 'warning' ? '#f1c40f' : '#3498db');
                            return `
                                <div style="display: flex; align-items: start; padding: 10px 0; border-bottom: 1px solid #f0f0f0; gap: 10px;">
                                    <span style="color: ${color}; font-size: 1.2rem; line-height: 1;">•</span>
                                    <div style="flex: 1;">
                                        <p style="margin: 0; font-size: 0.9rem; color: #333;">${log.message}</p>
                                        <small style="color: #999; font-size: 0.75rem;">${new Date(log.time).toLocaleTimeString()}</small>
                                    </div>
                                </div>
                            `;
                        }).join('') : '<p style="text-align:center; color: #888; padding: 20px;">No recent activity.</p>'}
                    </div>
                </div>

            </div>
        `;
    } catch (error) {
        console.error("Dashboard Error:", error);
        content.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 50px;">
                <i class="ri-error-warning-line" style="font-size: 3rem; color: #e74c3c;"></i>
                <p>Failed to load dashboard data. Please check your connection or server logs.</p>
                <button onclick="loadDashboard()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}
async function loadUsers(type) {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Loading Users...</div>';

    try {
        const res = await fetch('http://localhost:3000/admin/users');
        const data = await res.json();
        const filteredUsers = data.users.filter(u => u.user_type === type);

        content.innerHTML = `
            <h1 class="page-title">${type.charAt(0).toUpperCase() + type.slice(1)} Management</h1>
            <div class="table-section">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            ${type === 'owner' ? '<th>Status</th>' : ''}
                            ${type === 'owner' ? '<th>Verification Action</th>' : ''}
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUsers.map(u => `
                            <tr>
                                <td>#${u.user_id}</td>
                                <td>${u.first_name} ${u.last_name}</td>
                                <td>${u.email}</td>
                                ${type === 'owner' ? `
                                    <td>
                                        ${u.is_verified 
                                            ? '<span class="status-badge status-active">Verified</span>' 
                                            : '<span class="status-badge status-pending">Unverified</span>'}
                                    </td>
                                    <td>
                                        ${u.is_verified ? `
                                            <button onclick="toggleVerification(${u.user_id}, 'unverify')" 
                                                style="background: #ff9800; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                                <i class="ri-shield-cross-line"></i> Unverify
                                            </button>
                                        ` : `
                                            <button onclick="toggleVerification(${u.user_id}, 'verify')" 
                                                style="background: #4caf50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                                <i class="ri-shield-check-line"></i> Verify
                                            </button>
                                        `}
                                    </td>
                                ` : ''}
                                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<p class="error">Error loading users.</p>';
    }
}

// New Action Handler
window.toggleVerification = async (userId, action) => {
    const confirmMsg = action === 'unverify' 
        ? "Are you sure you want to remove verification for this owner? They may lose access to list new cars." 
        : "Verify this owner?";
        
    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch('http://localhost:3000/admin/manage-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            loadUsers('owner'); // Refresh the owner list
        }
    } catch (err) {
        alert("Action failed");
    }
};
// --- VIEW: CARS ---
async function loadCars() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Loading Cars...</div>';
    
    try {
        const res = await fetch('http://localhost:3000/admin/cars');
        const data = await res.json();
        
        content.innerHTML = `
            <h1 class="page-title">Car Management</h1>
            <div class="table-section">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 180px;">Car Preview</th> 
                            <th>Model & ID</th>
                            <th>Owner</th>
                            <th>Location</th> <th>Price/Day</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.cars.map(c => `
                            <tr>
                                <td style="padding: 15px;">
                                    <div style="width: 150px; height: 100px; background: #f9f9f9; border-radius: 8px; overflow: hidden; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;">
                                        <img src="${c.image_url || '/assets/placeholder-car.png'}" 
                                             alt="${c.model}" 
                                             style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                    </div>
                                </td>
                                <td>
                                    <div style="font-weight: 600; color: var(--primary-color-dark);">
                                        ${c.model} 
                                        <span style="font-size: 0.75rem; background: #eee; padding: 2px 6px; border-radius: 4px; margin-left: 5px; color: #666;">
                                            ID: #${c.car_id}
                                        </span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">Year: ${c.year}</div>
                                </td>
                                <td>${c.owner_name}</td>
                                <td>
                                    <i class="ri-map-pin-2-line" style="color: var(--primary-color);"></i> 
                                    ${c.location}
                                </td>
                                <td><strong>$${c.price_per_day}</strong></td>
                                <td><span class="status-badge status-${c.status}">${c.status}</span></td>
                                <td>
                                    <button onclick="deleteCar(${c.car_id})" style="color: #e74c3c; border:none; background:none; cursor:pointer; font-size: 1.4rem;" title="Delete Car">
                                        <i class="ri-delete-bin-line"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch(err) { 
        console.error(err);
        content.innerHTML = '<p class="error">Failed to load cars.</p>';
    }
}
// Action Handler for Deleting
window.deleteCar = async (carId) => {
    if (confirm("Are you sure you want to permanently delete this car from the database?")) {
        try {
            const res = await fetch('http://localhost:3000/admin/delete-car', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadCars(); // Refresh the list
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Error connecting to server.");
        }
    }
};


// --- ACTION HANDLERS ---
window.handleOwner = async (userId, action) => {
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        const res = await fetch('http://localhost:3000/admin/approve-owner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action })
        });
        const data = await res.json();
        if(data.success) {
            alert(data.message);
            loadDashboard(); // Refresh
        }
    } catch(err) {
        alert("Action failed");
    }
};

window.logout = () => {
    localStorage.clear();
    window.location.href = '/html/login.html';
};

// --- UTILS ---
function renderPlaceholder(title) {
    document.getElementById('content-area').innerHTML = `
        <h1 class="page-title">${title.toUpperCase()}</h1>
        <div class="card-box"><p>This module is under development.</p></div>
    `;
}

function setupMobileMenu() {
    document.getElementById('openMenu').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('logout-btn').addEventListener('click', window.logout);
}