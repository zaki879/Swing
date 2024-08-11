
  
  const refreshAccessToken = () => {
    console.log('Starting refresh token process'); // Log at the beginning


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
const refreshToken = localStorage.getItem('refreshToken');
  
    return fetch('https://beep-zlaa.onrender.com/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    })
    .then(response => {
      console.log('Received refresh token response:', response); // Log the response object
      if (!response.ok) {
        throw new Error('Refresh token request failed with status: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('Refresh token response data:', data); // Log the response data
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        fetchPositions();
        return data.accessToken;
      } else {
        throw new Error('Failed to refresh access token: Invalid response data');
      }
    })
    .catch(error => {
      console.error('Error refreshing access token:', error);
      throw error; // rethrow to handle in the caller
    });
  };
  
  
  // Initiate the login and fetch positions


const fetchPositions = () => {
        let accessToken = localStorage.getItem('accessToken');
      
        return fetch('https://beep-zlaa.onrender.com/api/positions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        .then(response => {
          if (response.status === 401) {
            // Access token expired, try to refresh it
            return refreshAccessToken().then(newAccessToken => {
              return fetch('https://beep-zlaa.onrender.com/api/positions', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${newAccessToken}`
                }
              });
            });
          }
          if (!response.ok) {
            throw new Error('Fetch positions request failed with status: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log('Positions data:', data);
          populateDropdown(data); // Call the function to populate the dropdown
          return data;
        })
        .catch(error => console.error('Error fetching positions:', error));
      };
      
      const populateDropdown = (positions) => {
        const dropdown = document.getElementById('specialty-dropdown');
        dropdown.innerHTML = '<option value="">Select Specialty</option>'; // Reset the dropdown
      
        positions.forEach(position => {
          const option = document.createElement('option');
          option.value = position.positionName; // You can use position._id or another field as the value
          option.textContent = position.positionName; // Display positionName as the text
          dropdown.appendChild(option);
        });
      };


// In one JS file where you initialize usersMap
window.usersMap = new Map();

const fetchUsers = () => {
        let accessToken = localStorage.getItem('accessToken');
      
        return fetch('https://beep-zlaa.onrender.com/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Fetch users request failed with status: ' + response.status);
          }
          return response.json();
        })
        .then(users => {
          console.log('Users data:', users);
          users.forEach(user => {
            usersMap.set(user._id, user);
        });
          return fetchPositions().then(positions => {
            populateUsers(users, positions);
          });
        })
        .catch(error => console.error('Error fetching users:', error));
};
      

const populateUsers = (users, positions) => {
  
  const userContainer = document.querySelector('.user-scroll');
  userContainer.innerHTML = ''; // Clear existing content

  const positionMap = new Map();
  positions.forEach(position => {
    positionMap.set(position._id, position.positionName);
  });

  users.forEach((user, index) => {
    const positionName = positionMap.get(user.positionID) || 'Unknown Position';
    const userItem = document.createElement('div');
    userItem.classList.add('user-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${user._id}`;
    checkbox.classList.add('user-checkbox');

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    
    const nameSpan = document.createElement('span');
    nameSpan.classList.add('user-name');
    const firstNameCapitalized = capitalizeFirstLetter(user.firstName);
    nameSpan.textContent = `${firstNameCapitalized} ${user.lastName}`;
    
    const positionSpan = document.createElement('span');
    positionSpan.classList.add('user-position');
    positionSpan.textContent = positionName;
    
    label.appendChild(nameSpan);
    label.appendChild(positionSpan);

    userItem.appendChild(checkbox);
    userItem.appendChild(label);
    userContainer.appendChild(userItem);
  });
};


// Fetch users and populate them into the HTML
fetchUsers();
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
