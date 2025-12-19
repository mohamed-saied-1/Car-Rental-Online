// --- MESSAGE HANDLING HELPERS (Modern UX) ---

// Helper to display messages in the designated box
function displayMessage(id, message, isError = true) {
  const messageBox = document.getElementById(id);
  if (messageBox) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    messageBox.classList.toggle('error', isError);
  }
}

// Helper to clear both message boxes 
function clearMessages() {
  const loginMessage = document.getElementById('loginMessage');
  const registerMessage = document.getElementById('registerMessage');
  if (loginMessage) loginMessage.style.display = 'none';
  if (registerMessage) registerMessage.style.display = 'none';
}


// --- LOGIN FUNCTION ---
async function login() {
  clearMessages(); 
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  console.log("Login attempt:", { email, password });

  // Basic validation 
  if (!email || !password) {
    displayMessage('loginMessage', 'Please fill in all fields to sign in.');
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!data.success) {
      displayMessage('loginMessage', data.message);
      return;
    }

// --- UPDATED SUCCESS LOGIC ---
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('userId', data.userId.toString());
    
    // Save these specifically for the booking page auto-fill
    localStorage.setItem('userFirstName', data.firstName);
    localStorage.setItem('userLastName', data.lastName);
    localStorage.setItem('userPhone', data.phone);

    // Optional: Keep this if other parts of your site use the full name string
    localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
    
    // Redirect based on role
    if (data.role === "admin") {
      window.location.href = "/html/admin.html";
    } else if (data.role === "owner") {
      window.location.href = "/html/owner.html";
    } else {
      window.location.href = "/html/index.html";
    }

  } catch (error) {
    console.error("Login error:", error);
    displayMessage('loginMessage', 'Network error. Please check if server is running.');
  }
}


// --- REGISTER FUNCTION (Includes Phone Number) ---
// --- SEND OTP FUNCTION ---
// --- OTP SENDING FOR REGISTER (With Countdown) ---
async function sendOTP() {
    const email = document.getElementById("registerEmail").value;
    const sendBtn = document.getElementById("sendOtpBtn");
    const otpGroup = document.getElementById("otpGroup");

    if (!email) {
        displayMessage('registerMessage', 'Please enter your email first.');
        return;
    }

    
    sendBtn.innerText = "Sending...";
    sendBtn.disabled = true;

    try {
        const res = await fetch("http://localhost:3000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.success) {
            displayMessage('registerMessage', 'Verification code sent to your email.', false);
            
            
            if (otpGroup) otpGroup.style.display = 'block';

            
            let seconds = 30;
            const timer = setInterval(() => {
                seconds--;
                sendBtn.innerText = `Resend (${seconds}s)`;
                sendBtn.style.color = "#999"; 
                sendBtn.style.borderColor = "#ddd";

                if (seconds <= 0) {
                    clearInterval(timer);
                    sendBtn.innerText = "Resend Code";
                    sendBtn.disabled = false;
                    sendBtn.style.color = "#7d72f1"; 
                    sendBtn.style.borderColor = "#7d72f1";
                }
            }, 1000);

        } else {
            displayMessage('registerMessage', data.message);
            sendBtn.innerText = "Send Code";
            sendBtn.disabled = false;
        }
    } catch (error) {
        displayMessage('registerMessage', 'Error sending code. Try again.');
        sendBtn.innerText = "Send Code";
        sendBtn.disabled = false;
    }
}


async function handleForgotOTP() {
    const email = document.getElementById("forgotEmailInput").value.trim();
    const btn = document.getElementById("sendForgotBtn");

    if (!email) {
        Swal.fire('Wait!', 'Please enter your email address first.', 'warning');
        return;
    }

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const res = await fetch("http://localhost:3000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.success) {
           
            Swal.fire({
                title: 'Sent!',
                text: 'Verification code sent to your email.',
                icon: 'success',
                confirmButtonColor: '#7d72f1'
            });
            
            document.getElementById("step1").style.display = "none";
            document.getElementById("step2").style.display = "block";
            document.getElementById("modalDesc").innerText = "Enter the code and your new password";
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Connection failed', 'error');
    } finally {
        btn.innerText = "Send Verification Code";
        btn.disabled = false;
    }
}


async function handlePasswordReset() {
    const email = document.getElementById("forgotEmailInput").value.trim();
    const otp = document.getElementById("forgotOtpInput").value.trim();
    const newPassword = document.getElementById("newPasswordInput").value;

    if (!otp || !newPassword) {
        Swal.fire('Error', 'Please fill in all fields', 'error');
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword })
        });

        const data = await res.json();

        if (data.success) {
           
            Swal.fire({
                title: 'Success!',
                text: 'Your password has been updated successfully.',
                icon: 'success',
                confirmButtonText: 'Login Now',
                confirmButtonColor: '#7d72f1' 
            }).then(() => {
                closeForgotModal();
              
            });
        } else {
           
            Swal.fire('Failed', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Something went wrong with the connection', 'error');
    }
}

// --- REGISTER FUNCTION (Modified with OTP) ---

async function register() {
  clearMessages(); 
  
  
  const firstName = document.getElementById("registerFirstName")?.value.trim() || "";
  const lastName = document.getElementById("registerLastName")?.value.trim() || "";
  const email = document.getElementById("registerEmail")?.value || "";
  const phone = document.getElementById("registerPhone")?.value || "";
  const password = document.getElementById("registerPassword")?.value || "";
  const otp = document.getElementById("registerOtp")?.value.trim() || "";
  
  
  const roleElement = document.querySelector('input[name="userRole"]:checked');
  if (!roleElement) {
    displayMessage('registerMessage', 'Please select whether you are a Customer or an Owner.');
    return;
  }
  const selectedRole = roleElement.value; 

 
  if (!firstName || !lastName || !email || !phone || !password || !otp) {
    displayMessage('registerMessage', 'Please fill in all fields and enter the OTP code.');
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone, 
        password,
        otp,
        role: selectedRole 
      })
    });

    const data = await res.json();
 if (data.success) {
      displayMessage('registerMessage', 'Registration successful! Redirecting to Sign In...', false);
      
      // Redirect to the login page after a short delay
       setTimeout(() => {
            window.location.href = "login.html"; 
            clearMessages();
        }, 1500);

    } else {
      displayMessage('registerMessage', "Registration failed: " + data.message);
    }
  } catch (error) {
    console.error("Registration error:", error);
    displayMessage('registerMessage', "Network error. Please check if server is running.");
  }
}

// --- ENTER KEY SUPPORT ---
document.addEventListener('DOMContentLoaded', function() {
  // Login form enter key
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        login();
      }
    });
  }

  // Register form enter key
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        register();
      }
    });
  }

  // Expose functions globally for onclick in HTML
  window.login = login;
  window.register = register;
});
