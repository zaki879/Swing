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

document.getElementById('add-room-button').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission

    const specialityName = document.getElementById('specialityname').value;
    const description = document.getElementById('description').value;

    let accessToken = localStorage.getItem('accessToken');

    fetch('https://beep-zlaa.onrender.com/api/positions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            positionName: specialityName,
            description: description
        })
    })
    .then(response => {
        if (response.status === 401) {
            return refreshAccessToken().then(newAccessToken => {
                return fetch('https://beep-zlaa.onrender.com/api/positions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newAccessToken}`
                    },
                    body: JSON.stringify({
                        positionName: specialityName,
                        description: description
                    })
                });
            });
        }
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.error.message || 'Add speciality request failed');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Speciality added successfully:', data);
        displayAlertsucceess('success', 'Added!', 'The speciality has been successfully added.', 'check');

        // Append the newly added speciality to the table
        const tableBody = document.getElementById('speciality-table-body');
        const row = document.createElement('tr');

        const descriptionText = data.description ? data.description : 'Undefined';

        row.innerHTML = `
            <td>${data.positionName}</td>
            <td>${descriptionText}</td>
            <td class="text-end">
                <div class="dropdown d-inline-block">
                    <a class="dropdown-toggle arrow-none" id="dLabel${data._id}" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                        <i class="las la-ellipsis-v fs-20 text-muted"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="dLabel${data._id}" style="background-color: rgb(15, 10, 37);">
                        <a class="dropdown-item" href="#" style="color: red;" onclick="deleteSpeciality('${data._id}')">Delete</a>
                    </div>
                </div>
            </td>
        `;

        tableBody.appendChild(row);

        // Optionally, clear the form fields
        document.getElementById('specialityname').value = '';
        document.getElementById('description').value = '';
    })
    .catch(error => {
        console.error('Error adding speciality:', error);
        displayAlertsucceess('danger', 'Error!', error.message, 'exclamation-triangle');
    });
});




const fetchSpecialities = () => {
    const accessToken = localStorage.getItem('accessToken');
  
    fetch('https://beep-zlaa.onrender.com/api/positions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      if (response.status === 401) {
        return refreshAccessToken().then(newAccessToken => {
          return fetch('https://beep-zlaa.onrender.com/api/positions', {
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
          throw new Error(errorData.error.message || 'Failed to fetch specialities');
        });
      }
      return response.json();
    })
    .then(specialities => {
      const tableBody = document.getElementById('speciality-table-body');
      tableBody.innerHTML = ''; // Clear existing table rows
  
      specialities.forEach(speciality => {
        const row = document.createElement('tr');
  
        // Check if description is empty and replace it with 'Undefined' if true
        const description = speciality.description ? speciality.description : 'Undefined';
  
        row.innerHTML = `
          <td>${speciality.positionName}</td>
          <td>${description}</td>
          <td class="text-end">
            <div class="dropdown d-inline-block">
              <a class="dropdown-toggle arrow-none" id="dLabel${speciality._id}" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                <i class="las la-ellipsis-v fs-20 text-muted"></i>
              </a>
              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="dLabel${speciality._id}" style="background-color: rgb(15, 10, 37);">
                <a class="dropdown-item" href="#" style="color: red;" onclick="deleteSpeciality('${speciality._id}')">Delete</a>
              </div>
            </div>
          </td>
        `;
  
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching specialities:', error);
      displayAlertsucceess('danger', 'Error!', error.message, 'exclamation-triangle');
    });
  };
  
  const deleteSpeciality = (specialityId) => {
    const accessToken = localStorage.getItem('accessToken');

    fetch(`https://beep-zlaa.onrender.com/api/positions/${specialityId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            return refreshAccessToken().then(newAccessToken => {
                return fetch(`https://beep-zlaa.onrender.com/api/positions/${specialityId}`, {
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
                throw new Error(errorData.error.message || 'Delete speciality request failed');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Speciality deleted successfully:', data);
        displayAlertsucceess('success', 'Deleted!', 'The speciality has been successfully deleted.', 'check');

        // Refresh the specialities table
        fetchSpecialities();
    })
    .catch(error => {
        console.error('Error deleting speciality:', error);
        displayAlertsucceess('danger', 'Error!', error.message, 'exclamation-triangle');
    });
};

  
  // Call fetchSpecialities when the page loads or at an appropriate time
  window.onload = fetchSpecialities;
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