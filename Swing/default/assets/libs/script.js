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


const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('month-year');
const datesContainer = document.getElementById('calendar-dates');
const eventModal = document.getElementById('event-modal');
const closeButton = document.querySelector('.close-button');
const saveEventButton = document.getElementById('save-event');
const eventStartTimeInput = document.getElementById('event-start-time');
const eventEndTimeInput = document.getElementById('event-end-time');

let now = new Date();
let currentMonth = now.getMonth();
let currentYear = now.getFullYear();
let selectedDates = []; // Array to track multiple selected dates
let isSelecting = false; // Flag to track if the user is holding down the mouse

const events = {};


function renderCalendar(month, year) {
    datesContainer.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' }).toUpperCase()} ${year}`;

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('date');
        emptyDiv.style.backgroundColor = 'transparent'; // Set background color for empty cells
        datesContainer.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dateDiv = document.createElement('div');
        dateDiv.classList.add('date');
        dateDiv.textContent = i;

        dateDiv.addEventListener('mousedown', (e) => {
            isSelecting = true;
            selectDate(i, dateDiv);
            e.preventDefault(); // Prevent default to avoid text selection
        });

        dateDiv.addEventListener('touchstart', (e) => {
            isSelecting = true;
            selectDate(i, dateDiv);
            e.preventDefault(); // Prevent default to avoid text selection
        });

        dateDiv.addEventListener('mouseover', () => {
            if (isSelecting) {
                selectDate(i, dateDiv);
            }
        });

        dateDiv.addEventListener('touchmove', (e) => {
            if (isSelecting) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.classList.contains('date')) {
                    const day = parseInt(target.textContent, 10);
                    if (!isNaN(day)) {
                        selectDate(day, target);
                    }
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isSelecting) {
                isSelecting = false;
                if (selectedDates.length > 0) {
                    eventModal.style.display = 'block';
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (isSelecting) {
                isSelecting = false;
                if (selectedDates.length > 0) {
                    eventModal.style.display = 'block';
                }
            }
        });

        datesContainer.appendChild(dateDiv);

        const eventKey = `${year}-${month}-${i}`;
        if (events[eventKey]) {
            events[eventKey].forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.textContent = event;
                dateDiv.appendChild(eventDiv);
            });
        }
    }

    // Fill the remaining cells with a blue background if there are any
    const totalCells = datesContainer.children.length;
    const cellsNeeded = 42 - totalCells; // Assuming a maximum of 6 rows (6 x 7 cells) for the calendar view

    for (let i = 0; i < cellsNeeded; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('date');
        emptyDiv.style.backgroundColor = 'transparent'; // Set background color for empty cells
        datesContainer.appendChild(emptyDiv);
    }
}

function selectDate(day, dateDiv) {
    const dateIndex = selectedDates.findIndex(selectedDate => selectedDate.day === day);

    if (dateIndex === -1) {
        selectedDates.push({ day, dateDiv });
        dateDiv.classList.add('selected');
    } else {
        selectedDates.splice(dateIndex, 1);
        dateDiv.classList.remove('selected');
    }
}
function closeModal() {
    eventModal.style.display = 'none';
    selectedDates = [];
    eventStartTimeInput.value = '';
    eventEndTimeInput.value = '';
    const allSelected = document.querySelectorAll('.selected');
    allSelected.forEach(div => div.classList.remove('selected'));
}
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

saveEventButton.addEventListener('click', () => {
    if (selectedDates.length > 0 && eventStartTimeInput.value.trim() !== '' && eventEndTimeInput.value.trim() !== '') {
        selectedDates.forEach(selectedDate => {
            const eventKey = `${currentYear}-${currentMonth}-${selectedDate.day}`;
            const startTime = eventStartTimeInput.value;
            const endTime = eventEndTimeInput.value;

            const eventText = `From ${startTime} to ${endTime}`;

            if (!events[eventKey]) {
                events[eventKey] = [];
            }
            events[eventKey].push(eventText);

            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.textContent = eventText;
            selectedDate.dateDiv.appendChild(eventDiv);
        });

        logEventDetails(); // Log event details after saving
        closeModal();
    }
});

closeButton.addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === eventModal) {
        closeModal();
    }
});

renderCalendar(currentMonth, currentYear);

closeButton.addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === eventModal) {
        closeModal();
    }
});

// Function to reset selected cells
function resetSelectedCells() {
    selectedDates.forEach(date => {
        const dateDiv = datesContainer.children[date.day + new Date(currentYear, currentMonth, 1).getDay() - 1];
        dateDiv.classList.remove('selected');
    });
    selectedDates = [];
}
function logEventDetails() {
    console.log('Event Details:');
    for (const [eventKey, eventList] of Object.entries(events)) {
        const [year, month, day] = eventKey.split('-').map(Number);
        eventList.forEach(event => {
            // Split the event string to extract startTime and endTime
            const [_, startTime, endTime] = event.match(/From (\d{2}:\d{2}) to (\d{2}:\d{2})/);

            console.log(`${year}-${month + 1}-${day} | ${startTime} | ${endTime}`);
        });
    }
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

document.addEventListener('DOMContentLoaded', function() {
   
   
    function logSelectedUsers() {
        const selectedUserIDs = [];
        const checkboxes = document.querySelectorAll('#user-list .user-item');

        checkboxes.forEach(item => {
            const checkbox = item.querySelector('.user-checkbox');
            if (checkbox.checked) {
                const userId = checkbox.id;           
                selectedUserIDs.push(userId); // Push the checkbox ID to the array
            }
        });

        console.log('Selected User IDs:', selectedUserIDs);
    }

    document.getElementById('select-all').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('#user-list .user-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        logSelectedUsers(); // Log selected user IDs after selecting all
    });

    document.getElementById('select-specialty').addEventListener('click', function() {
        const specialty = document.getElementById('specialty-dropdown').value;
        console.log('Selected Specialty:', specialty);

        if (specialty) {
            const checkboxes = document.querySelectorAll('#user-list .user-item');
            checkboxes.forEach(item => {
                const label = item.querySelector('label').textContent;
                if (label.includes(specialty)) {
                    item.querySelector('.user-checkbox').checked = true;
                }
            });
            logSelectedUsers(); // Log selected user IDs after selecting by specialty
        } else {
            const customAlert = new bootstrap.Modal(document.getElementById('customAlert'));
            customAlert.show();
        }
    });

    document.getElementById('remove-all').addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('#user-list .user-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        logSelectedUsers(); // Log selected user IDs after removing all
    });

    logSelectedUsers();
});
function getEventDetails() {
    const schedules = [];
    for (const [eventKey, eventList] of Object.entries(events)) {
        const [year, month, day] = eventKey.split('-').map(Number);
        eventList.forEach(event => {
            const [_, startTime, endTime] = event.match(/From (\d{2}:\d{2}) to (\d{2}:\d{2})/);
            schedules.push({
                date: `${year}-${month + 1}-${day}`,
                shiftStartTime: startTime,
                shiftEndTime: endTime
            });
        });
    }
    return schedules;
}

function getSelectedUserIDs() {
    const selectedUserIDs = [];
    const checkboxes = document.querySelectorAll('#user-list .user-item');

    checkboxes.forEach(item => {
        const checkbox = item.querySelector('.user-checkbox');
        if (checkbox.checked) {
            const userId = checkbox.id;           
            selectedUserIDs.push(userId); // Push the checkbox ID to the array
        }
    });

    return selectedUserIDs;
}
function postSchedules() {
    const eventDetails = getEventDetails();
    const selectedUserIDs = getSelectedUserIDs();

    if (eventDetails.length === 0 || selectedUserIDs.length === 0) {
        // Create a new alert element
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible shadow-sm border-theme-white-2 mb-0';
        errorAlert.role = 'alert';
        
        const errorMessage = document.createElement('span');
        errorMessage.textContent = 'No events or users selected.';
        
        errorAlert.innerHTML = `
            <div class="d-inline-flex justify-content-center align-items-center thumb-xs bg-danger rounded-circle mx-auto me-1">
                <i class="fas fa-xmark align-self-center mb-0 text-white"></i>
            </div>
            <strong>Error!</strong> ${errorMessage.outerHTML}
            <button type="button" class="btn-close" aria-label="Close"></button>
        `;

        // Append to alerts container
        document.getElementById('alerts-container').appendChild(errorAlert);

        // Add event listener to the close button
        errorAlert.querySelector('.btn-close').addEventListener('click', () => {
            errorAlert.classList.remove('show');
            setTimeout(() => {
                errorAlert.remove();
            }, 300); // Delay for animation to complete
        });

        // Trigger animation
        setTimeout(() => {
            errorAlert.classList.add('show');
        }, 10); // Short delay to ensure the element is in the DOM before applying the class

        // Automatically remove the alert after a delay (e.g., 5 seconds)
        setTimeout(() => {
            errorAlert.classList.remove('show');
            setTimeout(() => {
                errorAlert.remove();
            }, 300); // Delay for animation to complete
        }, 5000);

        return;
    }
    function displayAlert(type, strongText, message, iconClass) {
        // Create a new alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-danger alert-dismissible fade show shadow-sm border-theme-white-2 rounded-pill`;
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
        document.getElementById('alerts-container').appendChild(alert);
    
        // Add event listener to the close button
        alert.querySelector('.btn-close').addEventListener('click', () => {
            alert.classList.remove('show');
            setTimeout(() => {
                alert.remove();
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
            }, 300); // Delay for animation to complete
        }, 5000);
    }
    
    // Construct the request body
    const schedules = [];
    eventDetails.forEach(event => {
        selectedUserIDs.forEach(userId => {
            schedules.push({
                employee: userId,
                date: event.date,
                shiftStartTime: event.shiftStartTime,
                shiftEndTime: event.shiftEndTime
            });
        });
    });

    console.log('Posting schedules:', schedules); // Log the schedules being posted

    // Send the POST request
    fetch('https://beep-zlaa.onrender.com/api/schedules/bulk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Include authorization token if required
        },
        body: JSON.stringify(schedules)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Failed to post schedules. Status: ${response.status}. Message: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        displayAlert('success', 'Well done!', 'You successfully Publish new Schedule to Users', 'check');

    })
    .catch(error => {
        console.error('Error posting schedules:', error);
        
        // Create a new alert element for the error
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible shadow-sm border-theme-white-2 mb-0';
        errorAlert.role = 'alert';
        
        const errorMessage = document.createElement('span');
        errorMessage.textContent = error.message;
        
        errorAlert.innerHTML = `
            <div class="d-inline-flex justify-content-center align-items-center thumb-xs bg-danger rounded-circle mx-auto me-1">
                <i class="fas fa-xmark align-self-center mb-0 text-white"></i>
            </div>
            <strong>Error!</strong> ${errorMessage.outerHTML}
            <button type="button" class="btn-close" aria-label="Close" ></button>
        `;

        // Append to alerts container
        document.getElementById('alerts-container').appendChild(errorAlert);
        // Add event listener to the close button
        errorAlert.querySelector('.btn-close').addEventListener('click', () => {
            errorAlert.classList.remove('show');
            setTimeout(() => {
                errorAlert.remove();
            }, 300); // Delay for animation to complete
        });

        // Trigger animation
        setTimeout(() => {
            errorAlert.classList.add('show');
        }, 10); // Short delay to ensure the element is in the DOM before applying the class

        // Automatically remove the alert after a delay (e.g., 5 seconds)
        setTimeout(() => {
            errorAlert.classList.remove('show');
            setTimeout(() => {
                errorAlert.remove();
            }, 300); // Delay for animation to complete
        }, 5000);
    });
}

// Example usage (You can call this function when needed, e.g., on a button click)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('post-schedules').addEventListener('click', postSchedules);
});
function showTime(){
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    
    if(h == 0){
        h = 12;
    }
    
    if(h > 12){
        h = h - 12;
        session = "PM";
    }
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
    
}

showTime();
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