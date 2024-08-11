const login = (email, password) => {
    console.log('Starting login process');
    return fetch('https://beep-zlaa.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => {
      console.log('Received login response:', response);
      if (!response.ok) {
        throw new Error('Login request failed with status: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('Login response data:', data);
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('firstName', data.user.firstName);
        localStorage.setItem('lastName', data.user.lastName);
        console.log('Access Token:', data.accessToken, 'Refresh Token:', data.refreshToken);
        return data.accessToken;
      } else {
        throw new Error('Login failed: Invalid response data');
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
      throw error;
    });
  };
  
  document.getElementById('email-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('Email-3').value;
    const password = document.getElementById('Password').value;

    login(email, password)
      .then(accessToken => {
        displayAlertsucceess('success', 'Updated!', 'The user status has been successfully updated.', 'check');
        window.location.href = 'Dashboard.html'; // Redirect to Dashboard page
      })
      .catch(error => {
        alert('Login failed: ' + error.message);
      });
  });
  function displayAlertsucceess(type, strongText, message, iconClass, callback) {
    // Find the alerts container
    const alertsContainer = document.getElementById('alerts-container');
  
    // Check if the alerts container exists
    if (!alertsContainer) {
      console.error('Alerts container not found!');
      return;
    }
  
    // Create a new alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade shadow-sm border-theme-white-2 rounded-pill`;
    alert.role = 'alert';
    
    // Set default styles
    alert.style.backgroundColor = type === 'success' ? '#28a745' : (type === 'danger' ? '#dc3545' : ''); // Green for success, red for danger
    alert.style.color = '#fff'; // White text color
  
    alert.innerHTML = `
        <div class="d-inline-flex justify-content-center align-items-center thumb-xs bg-${type} rounded-circle mx-auto me-1">
            <i class="fas fa-${iconClass} align-self-center mb-0 text-white"></i>
        </div>
        <strong>${strongText}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  
    // Append to alerts container
    alertsContainer.appendChild(alert);
  
    // Trigger the animation
    setTimeout(() => {
        alert.classList.add('show');
    }, 10); // Short delay to ensure the element is in the DOM before applying the class
  
    // Add event listener to the close button
    alert.querySelector('.btn-close').addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
            if (callback) callback(); // Call the callback when the alert is removed
        }, 300); // Delay for animation to complete
    });
  
    // Automatically remove the alert after a delay (e.g., 5 seconds)
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
            if (callback) callback(); // Call the callback when the alert is removed
        }, 300); // Delay for animation to complete
    }, 5000);
  }