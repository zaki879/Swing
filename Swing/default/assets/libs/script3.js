// Function to refresh the access token
const refreshAccessToken = () => {
    console.log('Starting refresh token process');
    const refreshToken = localStorage.getItem('refreshToken');

    return fetch('https://beep-zlaa.onrender.com/api/auth/refresh-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
    })
    .then(response => {
        console.log('Received refresh token response:', response);
        if (!response.ok) {
            throw new Error('Refresh token request failed with status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Refresh token response data:', data);
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } else {
            throw new Error('Failed to refresh access token: Invalid response data');
        }
    })
    .catch(error => {
        console.error('Error refreshing access token:', error);
        // Optionally redirect to login page or logout the user here
        // window.location.href = '/login'; 
        throw error;
    });
};

// Function to delete a room by ID
const deleteRoom = (roomId) => {
    let accessToken = localStorage.getItem('accessToken');

    return fetch(`https://beep-zlaa.onrender.com/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            return refreshAccessToken().then(newAccessToken => {
                return fetch(`https://beep-zlaa.onrender.com/api/rooms/${roomId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`
                    }
                });
            });
        }
        if (!response.ok) {
            throw new Error('Delete room request failed with status: ' + response.status);
        }
        console.log(`Room with ID ${roomId} deleted successfully.`);
        fetchRooms(); // Refresh the table after deletion
    })
    .catch(error => console.error('Error deleting room:', error));
};

// Function to fetch and populate room data
const fetchRooms = () => {
    let accessToken = localStorage.getItem('accessToken');

    return fetch('https://beep-zlaa.onrender.com/api/rooms', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            return refreshAccessToken().then(newAccessToken => {
                return fetch('https://beep-zlaa.onrender.com/api/rooms', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`
                    }
                });
            });
        }
        if (!response.ok) {
            throw new Error('Fetch rooms request failed with status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Rooms data:', data);
        populateRoomTable(data);
        return data;
    })
    .catch(error => console.error('Error fetching rooms:', error));
};

// Function to populate the room data into the table
const populateRoomTable = (rooms) => {
    const tableBody = document.getElementById('room-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    rooms.forEach(room => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><img src="assets/images/logos/lang-logo/stairs.png" alt="" class="rounded-circle thumb-md me-1 d-inline"> ${room.floor}</td>
            <td>${room.roomNumber}</td>
            <td>${room.roomType}</td>
            <td class="text-end">
                <div class="dropdown d-inline-block">
                    <a class="dropdown-toggle arrow-none" id="dLabel${room._id}" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                        <i class="las la-ellipsis-v fs-20 text-muted"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="dLabel${room._id}" style="background-color: rgb(15, 10, 37);">
                        <a class="dropdown-item" href="#" style="color: red;" onclick="deleteRoom('${room._id}')">Delete</a>
                    </div>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Call the function to fetch and populate the table when the page loads
document.addEventListener('DOMContentLoaded', fetchRooms);
// Function to handle adding a room
// Function to handle adding a room
// Function to handle adding a room
const addRoom = (event) => {
    event.preventDefault(); // Prevent form submission

    const roomNumber = document.getElementById('roomNumber').value;
    const roomType = document.getElementById('roomType').value;
    const floor = document.getElementById('floorOfRoom').value;

    let accessToken = localStorage.getItem('accessToken');

    fetch('https://beep-zlaa.onrender.com/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            roomNumber: roomNumber,
            roomType: roomType,
            floor: parseInt(floor)
        })
    })
    .then(response => {
        if (response.status === 401) {
            return refreshAccessToken().then(newAccessToken => {
                return fetch('https://beep-zlaa.onrender.com/api/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`
                    },
                    body: JSON.stringify({
                        roomNumber: roomNumber,
                        roomType: roomType,
                        floor: parseInt(floor)
                    })
                });
            });
        }
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.error.message || 'Add room request failed');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Room added successfully:', data);
        displayAlertsucceess('success', 'Added!', 'The room has been successfully added.', 'check');

        fetchRooms(); // Refresh the room table
        // Optionally, clear the form fields
        document.getElementById('roomNumber').value = '';
        document.getElementById('roomType').value = '';
        document.getElementById('floorOfRoom').value = '';
    })
    .catch(error => {
        console.error('Error adding room:', error);
        displayAlertsucceess('danger', 'Error!', error.message, 'exclamation-triangle');
    });
};


// Function to append a single room to the table
const appendRoomToTable = (room) => {
    const tableBody = document.getElementById('room-table-body');

    const row = document.createElement('tr');

    row.innerHTML = `
        <td><img src="assets/images/logos/lang-logo/stairs.png" alt="" class="rounded-circle thumb-md me-1 d-inline"> ${room.floor}</td>
        <td>${room.roomNumber}</td>
        <td>${room.roomType}</td>
        <td class="text-end">
            <div class="dropdown d-inline-block">
                <a class="dropdown-toggle arrow-none" id="dLabel${room._id}" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                    <i class="las la-ellipsis-v fs-20 text-muted"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-end" aria-labelledby="dLabel${room._id}" style="background-color: rgb(15, 10, 37);">
                    <a class="dropdown-item" href="#" style="color: red;" onclick="deleteRoom('${room._id}')">Delete</a>
                </div>
            </div>
        </td>
    `;

    tableBody.appendChild(row);
};

// Add event listener to the "Add" button
document.getElementById('add-room-button').addEventListener('click', addRoom);


// Add event listener to the "Add" button
document.getElementById('add-room-button').addEventListener('click', addRoom);
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
    alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm border-theme-white-2 rounded-pill`;
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
  
    // Add event listener to the close button
    alert.querySelector('.btn-close').addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
            if (callback) callback(); // Call the callback when the alert is removed
        }, 300); // Delay for animation to complete
    });
  
    // Trigger animation
    setTimeout(() => {
        alert.classList.add('show');
    }, 10); // Short delay to ensure the element is in the DOM before applying the class
  
    // Automatically remove the alert after a delay (e.g., 5 seconds)
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
            if (callback) callback(); // Call the callback when the alert is removed
        }, 300); // Delay for animation to complete
    },8000);
  }
  function capitalizeFirstLetter(str) {
    if (!str) return ''; // Handle empty strings
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the saved values from localStorage
    const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  // Check if values exist
  if (firstName && lastName) {
    // Capitalize the first letter of firstName
    const formattedFirstName = capitalizeFirstLetter(firstName);

    // Update the HTML elements
    document.querySelector('.user-name').textContent = `${formattedFirstName} ${lastName}`;

    document.querySelector('.user-nam').textContent = `Welcome ${formattedFirstName} ${lastName}!`;
  }
  });
  document.getElementById('logout-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Remove tokens from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Send logout request to the API
    fetch('https://beep-zlaa.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Include any necessary headers, such as authorization tokens
        }
    })
    .then(response => {
        if (response.ok) {
            // Redirect to sign-in page
            window.location.href = 'sign-in.html';
        } else {
            // Handle logout error
            console.error('Logout failed');
        }
    })
    .catch(error => {
        // Handle network errors
        console.error('Network error:', error);
    });
});