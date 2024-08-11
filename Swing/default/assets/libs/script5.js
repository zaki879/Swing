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
const fetchPositions = async () => {
    try {
        let accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            accessToken = await refreshAccessToken(); // Refresh token if not present
            if (!accessToken) {
                console.error('No access token available');
                return {};
            }
        }

        let response = await fetch('https://beep-zlaa.onrender.com/api/positions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Retry logic if the response is 401
        if (response.status === 401) {
            console.log('Access token expired, attempting to refresh token');
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                console.error('Failed to refresh access token');
                return {};
            }

            // Retry the fetch request with the new access token
            response = await fetch('https://beep-zlaa.onrender.com/api/positions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (!response.ok) {
            throw new Error('Positions request failed with status: ' + response.status);
        }

        const data = await response.json();
        const positionMap = {};
        data.forEach(position => {
            positionMap[position._id] = position.positionName;
        });

        console.log('Position Map:', positionMap); // Debugging line
        return positionMap;

    } catch (error) {
        console.error('Error fetching positions:', error.message);
        return {}; // Return an empty object in case of error
    }
};

const fetchUsers = async () => {
    try {
        let accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            accessToken = await refreshAccessToken(); // Refresh token if not present
            if (!accessToken) {
                console.error('No access token available');
                return {};
            }
        }

        let response = await fetch('https://beep-zlaa.onrender.com/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Retry logic if the response is 401
        if (response.status === 401) {
            console.log('Access token expired, attempting to refresh token');
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                console.error('Failed to refresh access token');
                return {};
            }

            // Retry the fetch request with the new access token
            response = await fetch('https://beep-zlaa.onrender.com/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (!response.ok) {
            throw new Error('Users request failed with status: ' + response.status);
        }

        const data = await response.json();
        const userMap = {};
        data.forEach(user => {
            userMap[user._id] = `${user.firstName} ${user.lastName}`;
        });

        console.log('User Map:', userMap); // Debugging line
        return userMap;

    } catch (error) {
        console.error('Error fetching users:', error.message);
        return {}; // Return an empty object in case of error
    }
};

const fetchRooms = async () => {
    try {
        let accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            accessToken = await refreshAccessToken(); // Refresh token if not present
            if (!accessToken) {
                console.error('No access token available');
                return {};
            }
        }

        let response = await fetch('https://beep-zlaa.onrender.com/api/rooms', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Retry logic if the response is 401
        if (response.status === 401) {
            console.log('Access token expired, attempting to refresh token');
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                console.error('Failed to refresh access token');
                return {};
            }

            // Retry the fetch request with the new access token
            response = await fetch('https://beep-zlaa.onrender.com/api/rooms', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (!response.ok) {
            throw new Error('Rooms request failed with status: ' + response.status);
        }

        const data = await response.json();
        const roomMap = {};
        data.forEach(room => {
            // Create a detailed room string: "roomNumber-floor-roomType"
            roomMap[room._id] = `${room.roomNumber}-${room.floor}-${room.roomType}`;
        });

        console.log('Room Map:', roomMap); // Debugging line
        return roomMap;

    } catch (error) {
        console.error('Error fetching rooms:', error.message);
        return {}; // Return an empty object in case of error
    }
};

const deleteOrder = (orderId) => {
    const accessToken = localStorage.getItem('accessToken');
    return fetch(`https://beep-zlaa.onrender.com/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(response => {
        if (response.status === 401) {
            return refreshAccessToken().then(newAccessToken => {
                return fetch(`https://beep-zlaa.onrender.com/api/orders/${orderId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`
                    }
                });
            });
        }
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.error.message || 'Failed to delete order');
            });
        }
        return response.json();
    }).then(() => {
        console.log(`Order ${orderId} deleted successfully.`);
        fetchOrders(); // Refresh the orders list
    }).catch(error => {
        console.error('Error deleting order:', error);
        displayAlertsucceess('danger', 'Error!', error.message, 'exclamation-triangle');
    });
};
const formatDate = (isoDateString) => {
    // Create a Date object from the ISO date string
    const date = new Date(isoDateString);

    // Define options for date formatting
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    // Format the date using Intl.DateTimeFormat
    return date.toLocaleString('en-US', options);
};

// Example usage:
const isoDateString = '2024-06-30T19:03:57.283Z';
const formattedDate = formatDate(isoDateString);
console.log(formattedDate); // Output: "June 30, 2024 at 7:03:57 PM"

// Function to display order details in SweetAlert

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
  },2000);
}


// Call setupInfoIcons after fetching orders
const fetchOrders = () => {
    const accessToken = localStorage.getItem('accessToken');

    Promise.all([fetchPositions(), fetchUsers(), fetchRooms()]).then(([positionMap, userMap, roomMap]) => {
        return fetch('https://beep-zlaa.onrender.com/api/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            if (response.status === 401) {
                return refreshAccessToken().then(newAccessToken => {
                    return fetch('https://beep-zlaa.onrender.com/api/orders', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newAccessToken}`
                        }
                    });
                });
            }
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error.message || 'Failed to fetch orders');
                });
            }
            return response.json();
        }).then(data => {
            const tableBody = document.querySelector('tbody');
            tableBody.innerHTML = '';

            data.orders.forEach(order => {
                const positionName = positionMap[order.positionNeeded] || order.positionNeeded;
                const orderedByName = userMap[order.orderedBy] || order.orderedBy;
                const roomDetails = roomMap[order.room] || 'Undefined';

                let urgencyText;
                switch (order.urgencyLevel) {
                    case 1:
                        urgencyText = 'Normal';
                        break;
                    case 2:
                        urgencyText = 'Medium';
                        break;
                    case 3:
                        urgencyText = 'Urgent';
                        break;
                    default:
                        urgencyText = 'Unknown';
                }

                let statusBadge;
                switch (order.status.toLowerCase()) {
                    case 'completed':
                        statusBadge = '<span class="badge bg-success-subtle text-success"><i class="fas fa-check me-1"></i> Completed</span>';
                        break;
                    case 'pending':
                        statusBadge = '<span class="badge bg-secondary-subtle text-secondary"><i class="fas fa-clock me-1"></i> Pending</span>';
                        break;
                    default:
                        statusBadge = '<span class="badge bg-danger-subtle text-danger"><i class="fas fa-xmark me-1"></i> Cancel</span>';
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href='ecommerce-order-details'>${formatDate(order.orderDateTime)}</a></td>
                    <td>
                        <p class="d-inline-block align-middle mb-0">
                            <span class="d-block align-middle mb-0 product-name text-body">${positionName}</span>
                        </p>
                    </td>
                    <td>${urgencyText}</td>
                    <td>${roomDetails}</td>
                    <td>${statusBadge}</td>
                    <td>${orderedByName}</td>
                    <td class="text-end">
                        <a href="#" class="delete-icon" data-order-id="${order._id}"><i class="las la-trash-alt text-secondary fs-18"></i></a>
                    </td>
                `;
                tableBody.appendChild(row);
            });


            document.querySelectorAll('.delete-icon').forEach(icon => {
                icon.addEventListener('click', (event) => {
                    event.preventDefault();
                    const orderId = event.target.closest('a').getAttribute('data-order-id');

                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'You won’t be able to revert this!',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: 'red',
                        cancelButtonColor: '#22c55e',
                        confirmButtonText: 'Yes, delete it!',
                        cancelButtonText: 'Cancel',
                        customClass: {
                            title: 'custom-title',
                            confirmButton: 'custom-confirm-button',
                            cancelButton: 'custom-cancel-button'
                        },
                        didOpen: () => {
                            const popupElement = document.querySelector('.swal2-popup');
                            if (popupElement) {
                                popupElement.style.backgroundColor = '#fff';
                            }
                            const titleElement = document.querySelector('.swal2-title');
                            if (titleElement) {
                                titleElement.style.color = '#ff5722';
                                titleElement.style.fontSize = '1.5rem';
                            }
                            const confirmButton = document.querySelector('.swal2-confirm');
                            if (confirmButton) {
                                confirmButton.style.backgroundColor = 'red';
                                confirmButton.style.color = '#fff';
                            }
                            const cancelButton = document.querySelector('.swal2-cancel');
                            if (cancelButton) {
                                cancelButton.style.backgroundColor = '#22c55e';
                                cancelButton.style.color = '#fff';
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            deleteOrder(orderId);
                        }
                    });
                });
            });
        }).catch(error => {
            console.error('Error fetching orders:', error);
            displayAlertsucceess('danger', 'Error!', error.message, 'exclamation-triangle');
        });
    });
};

// Call fetchOrders when the page loads
window.onload = fetchOrders;
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