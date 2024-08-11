const refreshAccessToken = async () => {
  console.log('Starting refresh token process');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
      console.error('No refresh token found in localStorage');
      return null;
  }

  try {
      const response = await fetch('https://beep-zlaa.onrender.com/api/auth/refresh-token', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken })
      });

      console.log('Refresh token request status:', response.status);
      console.log('Refresh token request headers:', response.headers);

      if (response.status === 401) {
          console.error('Refresh token request failed: Unauthorized');
          return null;
      }

      if (!response.ok) {
          throw new Error('Refresh token request failed with status: ' + response.status);
      }

      const data = await response.json();
      console.log('Refresh token response data:', data);

      if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          return data.accessToken;
      } else {
          throw new Error('Failed to refresh access token: Invalid response data');
      }
  } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
  }
};

const fetchPositions = async () => {
  try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('https://beep-zlaa.onrender.com/api/positions', {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      if (response.status === 401) {
          // Token might be expired, refresh it
          await refreshAccessToken();
          return fetchPositions(); // Retry fetching positions
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching positions:', error);
  }
};

const fetchUsers = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('https://beep-zlaa.onrender.com/api/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, refresh it
      await refreshAccessToken();
      return fetchUsers(); // Retry fetching users
    }

    const data = await response.json();
    const userCount = data.length; // Count the number of users

    // Update the HTML element with the user count
    const staffElement = document.getElementById('staff');
    if (staffElement) {
      staffElement.textContent = userCount.toLocaleString(); // Update with formatted number
    }
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};


const fetchRooms = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('https://beep-zlaa.onrender.com/api/rooms', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, refresh it
      await refreshAccessToken();
      return fetchRooms(); // Retry fetching rooms
    }

    const data = await response.json();
    const roomCount = data.length; // Count the number of rooms

    // Update the HTML element with the room count
    const roomsElement = document.getElementById('rooms');
    if (roomsElement) {
      roomsElement.textContent = roomCount.toLocaleString(); // Update with formatted number
    }

    return data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};
const fetchPositionById = async (positionID) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`https://beep-zlaa.onrender.com/api/positions/${positionID}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, refresh it
      await refreshAccessToken();
      return fetchPositionById(positionID); // Retry fetching position
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching position:', error);
  }
};

const updateUserActiveStatus = async (userId, isActive) => {
  try {
    let accessToken = localStorage.getItem('accessToken');
    let response = await fetch(`https://beep-zlaa.onrender.com/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ isActive })
    });

    if (response.status === 401) {
      // Token might be expired, refresh it
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw new Error('Failed to refresh access token');
      }

      // Retry the request with the new token
      response = await fetch(`https://beep-zlaa.onrender.com/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ isActive })
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to update user status: ${response.status}`);
    }

    console.log(`User ${userId} active status updated to ${isActive}`);
    displayAlertsucceess('success', 'Updated!', 'The user status has been successfully updated.', 'check');
  } catch (error) {
    console.error('Error updating user active status:', error);
  }
};

const filterUsers = (users, filter) => {
  if (filter === 'active') {
    return users.filter(user => user.isActive);
  }
  return users; // Return all users if the filter is not 'active'
};

const displayUsers = (users) => {
  const onlineUsersTable = document.getElementById('onlineUsersTable');
  onlineUsersTable.innerHTML = ''; // Clear existing rows

  users.forEach(async user => {
    const row = document.createElement('tr');
    const position = await fetchPositionById(user.positionID);
    row.innerHTML = `
      <td style="display: flex; align-items: center;">
        <img src="assets/images/users/OIP.jpeg" alt="" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
        <div style="display: flex; flex-direction: column; justify-content: start;">
          <span style="border-radius: 5px; text-align: start;" class="textcolor">${user.firstName}</span>
          <span style="border-radius: 5px; text-align: start;" class="textcolor">${user.lastName}</span>
        </div>
      </td>
      <td>${position ? position.positionName : 'Unknown'}</td>
      <td style="text-align: right;">
        <div class="dropdown d-inline-block">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault-${user._id}" ${user.isActive ? 'checked' : ''} data-user-id="${user._id}">
          </div>
        </div>
      </td>
    `;
    onlineUsersTable.appendChild(row);

    // Add event listener to the checkbox
    const checkbox = document.getElementById(`flexSwitchCheckDefault-${user._id}`);
    checkbox.addEventListener('change', async (event) => {
      const isActive = event.target.checked;
      await updateUserActiveStatus(user._id, isActive);
    });
  });
};

const fetchAndDisplayUsers = async () => {
  const users = await fetchUsers();
  const userFilter = document.getElementById('userFilter').value;
  const filteredUsers = filterUsers(users, userFilter);
  displayUsers(filteredUsers);
};

const initializeDropdowns = () => {
  const dropdowns = document.querySelectorAll('.dropdown-toggle');
  dropdowns.forEach(dropdown => {
      new bootstrap.Dropdown(dropdown);
  });
};

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

document.addEventListener("DOMContentLoaded", async () => {
  // Set the default filter value to 'active'
  document.getElementById('userFilter').value = 'active';
  
  // Fetch and display users with the default filter
  await fetchAndDisplayUsers();
  fetchRooms();
 
  // Initialize dropdowns
  initializeDropdowns();

  // Connect to Socket.IO server
  const socket = io('https://beep-zlaa.onrender.com', {
    transports: ['websocket'],
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  document.getElementById('userFilter').addEventListener('change', fetchAndDisplayUsers);

  socket.on('getOnlineUsers', async (onlineUsers) => {
    console.log('Online users:', onlineUsers);
    const userFilter = document.getElementById('userFilter').value;
    const filteredUsers = filterUsers(onlineUsers, userFilter);
    displayUsers(filteredUsers);
  });
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