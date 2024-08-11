// Function to refresh the access token
const themeToggleButton = document.getElementById("light-dark-mode");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
}

function loadTheme() {
    const storedTheme = localStorage.getItem("theme") || "light";
    applyTheme(storedTheme);
}

themeToggleButton.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(newTheme);
});

// Load the saved theme on initial load
loadTheme();
document.getElementById('fullscreen-icon').addEventListener('click', function() {
    // Request fullscreen mode
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
});


const refreshAccessToken = async () => {
    console.log('Starting refresh token process');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.error('No refresh token found in localStorage');
        return null; // No refresh token available
    }

    try {
        const response = await fetch('https://beep-zlaa.onrender.com/api/auth/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        console.log('Received refresh token response:', response);
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
        return null; // Failed to refresh token
    }
};

// Fetch user data and create a mapping of user IDs to user details
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
            headers: {
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

            // Retry the fetch with the new access token
            response = await fetch('https://beep-zlaa.onrender.com/api/users', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (!response.ok) {
            throw new Error('User data request failed with status: ' + response.status);
        }

        const data = await response.json();
        console.log('User data:', data);

        // Map user IDs to user details
        const userMap = data.reduce((map, user) => {
            map[user._id] = user; // Assume user object has _id property
            return map;
        }, {});

        return userMap;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return {};
    }
}


// Function to fetch schedule data and use user details
const fetchScheduleData = async () => {
    try {
        let accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            accessToken = await refreshAccessToken(); // Refresh token if not present
            if (!accessToken) {
                console.error('No access token available');
                return;
            }
        }

        let response = await fetch('https://beep-zlaa.onrender.com/api/schedules', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Retry logic if the response is 401
        if (response.status === 401) {
            console.log('Access token expired, attempting to refresh token');
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                console.error('Failed to refresh access token');
                return;
            }

            // Retry the fetch with the new access token
            response = await fetch('https://beep-zlaa.onrender.com/api/schedules', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (!response.ok) {
            throw new Error('Schedule data request failed with status: ' + response.status);
        }

        const data = await response.json();
        console.log('Schedule data:', data);

        if (data.schedules && data.schedules.length > 0) {
            const userMap = await fetchUsers(); // Fetch users and create a mapping
            populateCalendar(data.schedules, userMap);
        } else {
            console.error("No schedule data found.");
        }
    } catch (error) {
        console.error("Error fetching schedule data:", error);
    }
};


// Function to populate the calendar with schedule data using user details
function populateCalendar(schedules, userMap) {
    schedules.forEach(schedule => {
        const { employee, date, shiftStartTime, shiftEndTime, _id: scheduleId } = schedule; // Include scheduleId

        // Replace employee ID with user's full name
        const user = userMap[employee];
        const employeeName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

        const cell = document.querySelector(`.calendar-cell[data-date="${date}"]`);

        if (cell) {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.classList.add('schedule-item');
            scheduleDiv.innerHTML = `
                <strong>${employeeName}</strong><br>
                ${shiftStartTime} - ${shiftEndTime}
            `;

            // Add event listener to open the update popup
            scheduleDiv.addEventListener('click', () => {
                openUpdatePopup(scheduleId, date, shiftStartTime, shiftEndTime); // Pass scheduleId here
            });

            cell.appendChild(scheduleDiv);
        } else {
            console.warn(`No calendar cell found for date ${date}`);
        }
    });
}

function openUpdatePopup(scheduleId, date, shiftStartTime, shiftEndTime) {
    document.getElementById('scheduleId').value = scheduleId;
    document.getElementById('scheduleDate').textContent = date;
    document.getElementById('shiftStartTime').value = shiftStartTime;
    document.getElementById('shiftEndTime').value = shiftEndTime;
    
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.add('show');
}

function closeUpdatePopup() {
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.remove('show');
}




// Function to handle calendar cell clicks
function handleCellClick(event) {
    const cell = event.currentTarget;
    const date = cell.getAttribute('data-date');

    // Get the schedule ID from the clicked cell
    const scheduleDiv = cell.querySelector('.schedule-item');
    const scheduleId = scheduleDiv ? scheduleDiv.getAttribute('data-schedule-id') : null;

    if (scheduleId) {
        showUpdateForm(scheduleId, date);
    } else {
        console.error('No schedule ID found in the clicked cell');
    }
}

// Function to show a form to update the schedule
function showUpdateForm(scheduleId, date) {
    const formHTML = `
        <form id="update-schedule-form" class="update-form">
            <label for="shiftStartTime">Shift Start Time:</label>
            <input type="time" id="shiftStartTime" name="shiftStartTime" required><br>
            <label for="shiftEndTime">Shift End Time:</label>
            <input type="time" id="shiftEndTime" name="shiftEndTime" required><br>
            <input type="hidden" id="scheduleId" name="scheduleId" value="${scheduleId}">
            <button type="submit" class="submit-btn">Update Schedule</button>
        </form>
    `;

    const overlay = document.getElementById('popup-overlay');
    const container = document.getElementById('update-schedule-form-container');
    
    container.innerHTML = `
        <button id="close-popup" class="close-popup">&times;</button>
        ${formHTML}
    `;

    overlay.classList.add('active');

    document.getElementById('close-popup').addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    document.getElementById('update-schedule-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await updateSchedule();
        overlay.classList.remove('active'); // Close the popup
    });
}
function refreshPage() {
    location.reload();
  }
  const deleteSchedule = async () => {
    try {
        const scheduleId = document.getElementById('scheduleId').value;
        if (!scheduleId) {
            console.error('No schedule ID provided for deletion');
            return;
        }

        let accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            accessToken = await refreshAccessToken(); // Refresh token if not present
            if (!accessToken) {
                console.error('No access token available');
                return;
            }
        }

        let response = await fetch(`https://beep-zlaa.onrender.com/api/schedules/${scheduleId}`, {
            method: 'DELETE',
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
                return;
            }

            // Retry the delete request with the new access token
            response = await fetch(`https://beep-zlaa.onrender.com/api/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }

        if (!response.ok) {
            let errorMessage = `Delete request failed with status: ${response.status}`;

            // Read response body as text
            const responseBody = await response.text();

            // Attempt to parse response body as JSON
            try {
                const errorData = JSON.parse(responseBody);
                errorMessage += `, message: ${errorData.error ? errorData.error.message : 'Unknown error'}`;
            } catch (jsonError) {
                // If JSON parsing fails, assume the response is plain text or HTML
                errorMessage += `, response: ${responseBody}`;
            }
            
            throw new Error(errorMessage);
        }

        await handleDeletion(); // Assuming this is a function that handles post-deletion tasks

        // Close the popup
        closeUpdatePopup();
    } catch (error) {
        // Display error message
        console.error('Error deleting schedule:', error.message);
        alert(`Error deleting schedule: ${error.message}`); // Display error to user
    }
}

async function handleDeletion() {
    // Display the alert and wait for it to complete
    await new Promise((resolve) => {
        displayAlertsucceess('success', 'Well done!', 'You successfully deleted it', 'check', resolve);
    });

    // Refresh the schedule data to reflect the deletion
    refreshPage();
}
async function handleUpdate() {
    // Display the alert and wait for it to complete
    await new Promise((resolve) => {
        displayAlertsucceess('success', 'Well done!', 'You successfully deleted it', 'check', resolve);
    });

    // Refresh the schedule data to reflect the deletion
    refreshPage();
}

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
    },10000);
  }
// Flag to track if an update is in progress
let isUpdating = false;

// Function to update the schedule
const updateSchedule = async () => {
    try {
        const scheduleId = document.getElementById('scheduleId').value;
        const shiftStartTime = document.getElementById('shiftStartTime').value;
        const shiftEndTime = document.getElementById('shiftEndTime').value;
        const date = document.getElementById('scheduleDate').value; // Retrieve the date from the hidden input
        
        if (!scheduleId) {
            console.error('No schedule ID provided for update');
            return;
        }

        let accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
            accessToken = await refreshAccessToken(); // Refresh token if not present
            if (!accessToken) {
                console.error('No access token available');
                return;
            }
        }

        let response = await fetch(`https://beep-zlaa.onrender.com/api/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                date,
                shiftStartTime,
                shiftEndTime
            })
        });

        // Retry logic if the response is 401
        if (response.status === 401) {
            console.log('Access token expired, attempting to refresh token');
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                console.error('Failed to refresh access token');
                return;
            }

            // Retry the update request with the new access token
            response = await fetch(`https://beep-zlaa.onrender.com/api/schedules/${scheduleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    date,
                    shiftStartTime,
                    shiftEndTime
                })
            });
        }

        if (!response.ok) {
            let errorMessage = `Update request failed with status: ${response.status}`;

            // Read response body as text
            const responseBody = await response.text();

            // Attempt to parse response body as JSON
            try {
                const errorData = JSON.parse(responseBody);
                errorMessage += `, message: ${errorData.error ? errorData.error.message : 'Unknown error'}`;
            } catch (jsonError) {
                // If JSON parsing fails, assume the response is plain text or HTML
                errorMessage += `, response: ${responseBody}`;
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Update response data:', data);

        // Refresh the schedule data to show the updated information
        handleUpdate();
    } catch (error) {
        // Display error message
        console.error('Error updating schedule:', error.message);
        alert(`Error updating schedule: ${error.message}`); // Display error to user
    }
};



function generateCalendarCells(year, month) {
    const calendarContainer = document.getElementById('calendar');

    // Clear existing cells
    calendarContainer.innerHTML = '';

    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));

    // Get the number of days in the month
    const numDays = lastDay.getUTCDate();

    // Create calendar cells for each day of the month
    for (let day = 1; day <= numDays; day++) {
        const date = new Date(Date.UTC(year, month, day));
        const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }); // Get the day name

        const cell = document.createElement('div');
        cell.classList.add('calendar-cell');
        cell.setAttribute('data-date', formattedDate);
        cell.innerHTML = `
            <div class="date">${day}</div>
            <div class="dayname">${dayName}</div>`
        ;

        calendarContainer.appendChild(cell);
    }
}
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();


  
  function capitalizeFirstLetter(str) {
    if (!str) return ''; // Handle empty strings
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
function  handleMonthChange(direction)  {
    if (direction === 'prev') {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    } else if (direction === 'next') {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
    }

     fetchScheduleData(); // Fetch new schedule data for the updated month
     generateCalendarCells(currentYear, currentMonth);

    // Update the calendar header with the new month and year
    updateCalendarHeader();
}

function updateCalendarHeader() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const calendarMonthYear = document.getElementById('calendar-month-year');
    calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

// Initial call to set the correct month and year when the page loads
updateCalendarHeader();

// Add event listeners for buttons
document.getElementById('prev-month').addEventListener('click', () => handleMonthChange('prev'));
document.getElementById('next-month').addEventListener('click', () => handleMonthChange('next'));

// Generate initial calendar for the current month
document.addEventListener("DOMContentLoaded", async() => {
    generateCalendarCells(currentYear, currentMonth);
    await handleMonthChange() ;
});
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