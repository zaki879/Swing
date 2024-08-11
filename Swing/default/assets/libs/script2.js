const refreshAccessToken = () => {
  console.log("Starting refresh token process"); // Log at the beginning

  const refreshToken = localStorage.getItem("refreshToken");

  return fetch("https://beep-zlaa.onrender.com/api/auth/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })
    .then((response) => {
      console.log("Received refresh token response:", response); // Log the response object
      if (!response.ok) {
        throw new Error(
          "Refresh token request failed with status: " + response.status
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log("Refresh token response data:", data); // Log the response data
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      } else {
        throw new Error(
          "Failed to refresh access token: Invalid response data"
        );
      }
    })
    .catch((error) => {
      console.error("Error refreshing access token:", error);
      throw error; // rethrow to handle in the caller
    });
};
refreshAccessToken().then(() => {
  fetchUsers();
});

const usersMap = new Map();

const fetchUsers = () => {
  let accessToken = localStorage.getItem("accessToken");

  return fetch("https://beep-zlaa.onrender.com/api/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Fetch users request failed with status: " + response.status
        );
      }
      return response.json();
    })
    .then((users) => {
      console.log("Users data:", users);
      users.forEach((user) => {
        usersMap.set(user._id, user);
      });

      return fetchPositions().then((positions) => {
        populateUsers(users, positions);
      });
    })
    .catch((error) => console.error("Error fetching users:", error));
};

const fetchPositions = () => {
  let accessToken = localStorage.getItem("accessToken");

  return fetch("https://beep-zlaa.onrender.com/api/positions", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        return refreshAccessToken().then((newAccessToken) => {
          return fetch("https://beep-zlaa.onrender.com/api/positions", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });
        });
      }
      if (!response.ok) {
        throw new Error(
          "Fetch positions request failed with status: " + response.status
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log("Positions data:", data);
      populatePositionDropdown(data);
      return data;
    })
    .catch((error) => console.error("Error fetching positions:", error));
};
document
  .getElementById("positionname-new")
  .addEventListener("change", (event) => {
    const selectedPositionId = event.target.value;
    document.getElementById("position-id-new").value = selectedPositionId;
  });
document.getElementById("positionname").addEventListener("change", (event) => {
  const selectedPositionId = event.target.value;
  document.getElementById("position-id").value = selectedPositionId;
});
let floorsFetched = false;

const fetchFloors = () => {
  let accessToken = localStorage.getItem("accessToken");

  return fetch("https://beep-zlaa.onrender.com/api/rooms/floors", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        return refreshAccessToken().then((newAccessToken) => {
          return fetch("https://beep-zlaa.onrender.com/api/rooms/floors", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });
        });
      }
      if (!response.ok) {
        throw new Error(
          "Fetch floors request failed with status: " + response.status
        );
      }
      return response.json();
    })
    .then((floors) => {
      console.log("Floors data:", floors);
      populateFloorDropdown(floors);
      floorsFetched = true; // Set flag to true when floors are fetched
    })
    .catch((error) => console.error("Error fetching floors:", error));
};

const populateFloorDropdown = (floors) => {
  const floorDropdown = $("#floors-select");
  floorDropdown.empty(); // Clear existing options

  floors.forEach((floor) => {
    const option = new Option(floor, floor, false, false);
    floorDropdown.append(option);
  });

  // Initialize Select2
  floorDropdown.select2({
    placeholder: "Select floors",
    allowClear: true,
    width: "100%",
  });

  // Apply styles after Select2 initialization
  setTimeout(() => {
    $(".select2-container--default .select2-selection--single").css(
      "background-color",
      "#f5f5f5"
    );
    $(".select2-container--default .select2-results__option").css(
      "background-color",
      "#fff"
    );
  }, 0);
};

$(document).ready(() => {
  fetchFloors();
});

const populatePositionDropdown = (positions) => {
  const positionDropdown = document.getElementById("positionname-new");
  positionDropdown.innerHTML = ""; // Clear existing options

  positions.forEach((position) => {
    const option = document.createElement("option");
    option.value = position._id; // Set the value to position ID
    option.textContent = position.positionName; // Display position name
    positionDropdown.appendChild(option);
  });
  const positionDropdownnew = document.getElementById("positionname");
  positionDropdownnew.innerHTML = ""; // Clear existing options

  positions.forEach((position) => {
    const option = document.createElement("option");
    option.value = position._id; // Set the value to position ID
    option.textContent = position.positionName; // Display position name
    positionDropdownnew.appendChild(option);
  });
};
function capitalizeFirstLetter(str) {
  if (!str) return ""; // Handle empty strings
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Call fetchPositions when the document is ready or when needed
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the saved values from localStorage
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  // Check if values exist
  if (firstName && lastName) {
    // Capitalize the first letter of firstName
    const formattedFirstName = capitalizeFirstLetter(firstName);

    // Update the HTML elements
    document.querySelector(
      ".user-name"
    ).textContent = `${formattedFirstName} ${lastName}`;

    document.querySelector(
      ".user-nam"
    ).textContent = `Welcome ${formattedFirstName} ${lastName}!`;
  }

  fetchPositions();
});

const populateUsers = (users, positions) => {
  const usersContainer = document.getElementById("users-container");

  if (!usersContainer) {
    console.error("users-container element not found!");
    return;
  }

  const positionMap = new Map();
  positions.forEach((position) => {
    positionMap.set(position._id, position.positionName);
  });

  // Start of modified users.forEach loop with logging
  users.forEach((user) => {
    console.log("User positionID:", user.positionID); // Debugging: log user positionID
    const positionName = positionMap.get(user.positionID) || "Unknown Position";
    console.log("Position Name:", positionName); // Debugging: log position name

    const userCard = `
          <div class="col-md-6 col-lg-4">
              <div class="card">
                  <div class="card-body p-4 color-bg rounded text-center">
                      <h4 class="text-white opacity-75 fs-16 mb-0"></h4>
                  </div>
                  <div class="position-relative">
                      <div class="shape overflow-hidden text-card-bg">
                          <svg viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
                          </svg>
                      </div>
                  </div>
                  <div class="card-body mt-n5">
                      <div class="position-relative">
                          <img src="assets/images/users/profile.png" alt="" class="rounded-circle thumb-xxl">
                      </div>
                      <div class="row mt-3 align-items-center">
                          <div class="col-auto col-md-6">
                              <div class="">
                                  <h5 class="m-0 fw-bold">${user.firstName} ${user.lastName}</h5>
                                  <p class="text-muted mb-0">${positionName}</p>
                              </div>
                          </div>
                      </div>
                      <div style="height: 10px;"></div>
                      <div class="text-muted mb-2 d-flex align-items-center">
                          <i class="iconoir-mail-out fs-20 me-1"></i>
                          <span class="text-body fw-semibold">Email :</span>
                          <a href="mailto:${user.email}" class="text-primary text-decoration-underline">${user.email}</a>
                      </div>
                      <div class="text-body d-flex align-items-center">
                          <i class="iconoir-phone fs-20 me-1 text-muted"></i>
                          <span class="text-body fw-semibold">Phone :</span> ${user.phone}
                      </div>
                      <div class="mt-3">
                          <a id="edit-profile-${user._id}" class="btn btn-sm btn-primary px-2 d-inline-flex align-items-center">
                              <i class="iconoir-user fs-14 me-1"></i>Edit Profile
                          </a>
                          <a id="delete-user-${user._id}" class="btn btn-sm btn-outline-primary px-2 d-inline-flex align-items-center">
                              <i class="iconoir-xmark-circle fs-14 me-1"></i>Delete
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      `;
    usersContainer.innerHTML += userCard;
  });
  // Add click event listeners for the "Delete" buttons
  users.forEach((user) => {
    // Edit Profile button
    document
      .getElementById(`edit-profile-${user._id}`)
      .addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        showEditProfilePopup(user, positionName);
      });

    // Delete button
    document
      .getElementById(`delete-user-${user._id}`)
      .addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior

        Swal.fire({
          title: "Are you sure?",
          text: "You won’t be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "red",
          cancelButtonColor: "#22c55e",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
          customClass: {
            title: "custom-title", // Apply custom class to title
            confirmButton: "custom-confirm-button", // Apply custom class to confirm button
            cancelButton: "custom-cancel-button", // Apply custom class to cancel button
          },
          didOpen: () => {
            // Apply styles directly after the popup is rendered
            const popupElement = document.querySelector(".swal2-popup");
            if (popupElement) {
              popupElement.style.backgroundColor = "#fff"; // Set background to white
            }

            const titleElement = document.querySelector(".swal2-title");
            if (titleElement) {
              titleElement.style.color = "#ff5722"; // Set your desired color
              titleElement.style.fontSize = "1.5rem"; // Customize font size if needed
            }
            const confirmButton = document.querySelector(".swal2-confirm");
            if (confirmButton) {
              confirmButton.style.backgroundColor = "red"; // Set your desired color
              confirmButton.style.color = "#fff"; // Set text color
            }
            const cancelButton = document.querySelector(".swal2-cancel");
            if (cancelButton) {
              cancelButton.style.backgroundColor = "#22c55e"; // Set your desired color
              cancelButton.style.color = "#fff"; // Set text color
            }
          },
        }).then((result) => {
          if (result.isConfirmed) {
            deleteUser(user._id);
          }
        });
      });
  });
  const deleteUser = async (userId) => {
    try {
      let accessToken = localStorage.getItem("accessToken");

      // Initial DELETE request
      let response = await fetch(
        `https://beep-zlaa.onrender.com/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Retry logic if the response is 401
      if (response.status === 401) {
        console.log("Access token expired, attempting to refresh token");
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          console.error("Failed to refresh access token");
          return;
        }

        // Retry the DELETE request with the new access token
        response = await fetch(
          `https://beep-zlaa.onrender.com/api/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "Delete user request failed with status: " + response.status
        );
      }

      // Handle the response if needed
      console.log("User deleted successfully");

      // Optionally show a success message
      displayAlert(
        "success",
        "Deleted!",
        "The user has been successfully deleted.",
        "check"
      );

      // Refresh the page
      refreshPage();
    } catch (error) {
      console.error("Error deleting user:", error);
      // Optionally display an error message to the user
      displayAlert(
        "error",
        "Error",
        `Failed to delete user: ${error.message}`,
        "error"
      );
    }
  };

  // Add click event listeners for the "Edit Profile" buttons
  users.forEach((user) => {
    const positionID = user.positionID;
    const positionName = positionMap.get(user.positionID) || "Unknown Position";

    document
      .getElementById(`edit-profile-${user._id}`)
      .addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        showEditProfilePopup(user, positionName, positionID);
      });
  });
};

const showEditProfilePopup = (user, positionName, positionID) => {
  // Populate the form with user data
  document.getElementById("firstname").value = user.firstName;
  document.getElementById("lastname").value = user.lastName;
  document.getElementById("phone").value = user.phone;

  // Set the initial value of the position dropdown
  const positionDropdown = document.getElementById("positionname");
  const positionIdInput = document.getElementById("position-id");

  // Set the value of the position dropdown to the user's current position ID
  positionDropdown.value = user.positionID;
  positionIdInput.value = user.positionID;

  // Show the popup
  const popup = document.getElementById("edit-profile-popup");
  popup.classList.add("show");

  // Handle form submission
  document.getElementById("edit-profile-form").onsubmit = (event) => {
    event.preventDefault(); // Prevent the form from submitting normally

    const updatedUser = {
      _id: user._id, // Assuming you still have the user ID available
      firstName: document.getElementById("firstname").value,
      lastName: document.getElementById("lastname").value,
      phone: document.getElementById("phone").value,
      positionID: document.getElementById("position-id").value,
    };
    console.log(updateUser);

    // Call a function to update user data here
    updateUser(updatedUser);
  };
};

const showEditProfilePopupNew = () => {
  // Clear the form inputs
  document.getElementById("firstname-new").value = "";
  document.getElementById("lastname-new").value = "";
  document.getElementById("phone-new").value = "";
  document.getElementById("position-id-new").value = "";
  document.getElementById("email-new").value = "";
  // Clear the floors selection
  const floorsSelect = document.getElementById("floors-select");
  for (let i = 0; i < floorsSelect.options.length; i++) {
    floorsSelect.options[i].selected = false;
  }

  // Show the popup
  const popup = document.getElementById("edit-profile-popup-new");
  popup.classList.add("show-new");

  // Handle form submission
  document.getElementById("edit-profile-form-new").onsubmit = (event) => {
    event.preventDefault(); // Prevent the form from submitting normally

    // Retrieve form values
    const firstName = document.getElementById("firstname-new").value;
    const lastName = document.getElementById("lastname-new").value;
    const phone = document.getElementById("phone-new").value;
    const positionID = document.getElementById("position-id-new").value;
    const email = document.getElementById("email-new").value;

    // Retrieve selected floors
    const selectedFloors = Array.from(
      document.getElementById("floors-select").selectedOptions
    ).map((option) => option.value);

    // Check if all inputs are filled
    if (
      firstName === "" ||
      lastName === "" ||
      phone === "" ||
      positionID === "" ||
      selectedFloors.length === 0
    ) {
      // Display an error alert if any input is empty
      new Promise((resolve) => {
        displayAlertalert(
          "danger",
          "You have a mistake!",
          "You must fill all the inputs and select at least one floor.",
          "xmark",
          resolve
        );
      });
    } else {
      // Create the user object
      const addUser = {
        firstName: firstName,
        lastName: lastName,
        positionID: positionID,
        email: email,
        phone: phone,
        floor: selectedFloors.map(Number), // Convert floor IDs to numbers
      };

      // Call a function to add the user
      AddUser(addUser);
    }
  };
};

const closeEditProfilePopup = () => {
  const popup = document.getElementById("edit-profile-popup");
  popup.classList.remove("show");
  // Optionally, you can hide the popup after the animation ends
  setTimeout(() => {
    popup.classList.add("hidden");
  }, 300); // Matches the duration of the animation
};
const closeEditProfilePopupnew = () => {
  const popup = document.getElementById("edit-profile-popup-new");
  popup.classList.remove("show-new");
  // Optionally, you can hide the popup after the animation ends
  setTimeout(() => {
    popup.classList.add("hidden");
  }, 300); // Matches the duration of the animation
};
// Add event listener to the close button
document
  .getElementById("close-popup")
  .addEventListener("click", closeEditProfilePopup);
document
  .getElementById("close-popup-new")
  .addEventListener("click", closeEditProfilePopupnew);

// Optional: Close the popup when clicking outside of it
document.addEventListener("click", (event) => {
  const popup = document.getElementById("edit-profile-popup");
  if (event.target === popup) {
    closeEditProfilePopup();
  }
});
document.addEventListener("click", (event) => {
  const popup = document.getElementById("edit-profile-popup-new");
  if (event.target === popup) {
    closeEditProfilePopupnew();
  }
});
function displayAlertalert(type, strongText, message, iconClass, callback) {
  // Find the alerts container
  const alertsContainer = document.getElementById("alerts-container");

  // Check if the alerts container exists
  if (!alertsContainer) {
    console.error("Alerts container not found!");
    return;
  }

  // Create a new alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-danger alert-dismissible shadow-sm border-theme-white-2 mb-0`;
  alert.role = "alert";

  // Set default styles
  alert.style.backgroundColor =
    type === "success" ? "#28a745" : type === "danger" ? "#dc3545" : ""; // Green for success, red for danger
  alert.style.color = "#fff"; // White text color

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
  alert.querySelector(".btn-close").addEventListener("click", () => {
    alert.classList.remove("show");
    setTimeout(() => {
      alert.remove();
      if (callback) callback(); // Call the callback when the alert is removed
    }, 300); // Delay for animation to complete
  });

  // Trigger animation
  setTimeout(() => {
    alert.classList.add("show");
  }, 10); // Short delay to ensure the element is in the DOM before applying the class

  // Automatically remove the alert after a delay (e.g., 5 seconds)
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => {
      alert.remove();
      if (callback) callback(); // Call the callback when the alert is removed
    }, 300); // Delay for animation to complete
  }, 2000);
}
function displayAlertsucceess(type, strongText, message, iconClass, callback) {
  // Find the alerts container
  const alertsContainer = document.getElementById("alerts-container");

  // Check if the alerts container exists
  if (!alertsContainer) {
    console.error("Alerts container not found!");
    return;
  }

  // Create a new alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm border-theme-white-2 rounded-pill`;
  alert.role = "alert";

  // Set default styles
  alert.style.backgroundColor =
    type === "success" ? "#28a745" : type === "danger" ? "#dc3545" : ""; // Green for success, red for danger
  alert.style.color = "#fff"; // White text color

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
  alert.querySelector(".btn-close").addEventListener("click", () => {
    alert.classList.remove("show");
    setTimeout(() => {
      alert.remove();
      if (callback) callback(); // Call the callback when the alert is removed
    }, 300); // Delay for animation to complete
  });

  // Trigger animation
  setTimeout(() => {
    alert.classList.add("show");
  }, 10); // Short delay to ensure the element is in the DOM before applying the class

  // Automatically remove the alert after a delay (e.g., 5 seconds)
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => {
      alert.remove();
      if (callback) callback(); // Call the callback when the alert is removed
    }, 300); // Delay for animation to complete
  }, 2000);
}
function displayAlertsucceessuser(
  type,
  strongText,
  message,
  iconClass,
  callback
) {
  // Find the alerts container
  const alertsContainer = document.getElementById("alerts-container");

  // Check if the alerts container exists
  if (!alertsContainer) {
    console.error("Alerts container not found!");
    return;
  }

  // Create a new alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm border-theme-white-2 rounded-pill`;
  alert.role = "alert";

  // Set default styles
  alert.style.backgroundColor =
    type === "success" ? "#28a745" : type === "danger" ? "#dc3545" : ""; // Green for success, red for danger
  alert.style.color = "#fff"; // White text color

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
  alert.querySelector(".btn-close").addEventListener("click", () => {
    alert.classList.remove("show");
    setTimeout(() => {
      alert.remove();
      if (callback) callback(); // Call the callback when the alert is removed
    }, 300); // Delay for animation to complete
  });

  // Trigger animation
  setTimeout(() => {
    alert.classList.add("show");
  }, 10); // Short delay to ensure the element is in the DOM before applying the class

  // Automatically remove the alert after a delay (e.g., 5 seconds)
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => {
      alert.remove();
      if (callback) callback(); // Call the callback when the alert is removed
    }, 300); // Delay for animation to complete
  }, 15000);
}

function refreshPage() {
  location.reload();
}
const updateUser = async (user) => {
  try {
    let accessToken = localStorage.getItem("accessToken");
    console.log(user);

    // Initial PUT request
    let response = await fetch(
      `https://beep-zlaa.onrender.com/api/users/${user._id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }
    );

    // Retry logic if the response is 401
    if (response.status === 401) {
      console.log("Access token expired, attempting to refresh token");
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        console.error("Failed to refresh access token");
        return;
      }

      // Retry the PUT request with the new access token
      response = await fetch(
        `https://beep-zlaa.onrender.com/api/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
    }

    if (!response.ok) {
      throw new Error(
        "Update user request failed with status: " + response.status
      );
    }

    const updatedUser = await response.json();
    console.log("User updated:", updatedUser);

    // Display the success alert and return a Promise that resolves when the alert is removed
    await new Promise((resolve) => {
      displayAlertsucceess(
        "success",
        "Well done!",
        "You successfully updated the user",
        "check",
        resolve
      );
    });

    // Refresh user data and close the popup
    await fetchUsers();
    closeEditProfilePopup();
    refreshPage();
  } catch (error) {
    console.error("Error updating user:", error);
    // Optionally, display an error message to the user
    displayAlert(
      "error",
      "Error",
      `Failed to update user: ${error.message}`,
      "error"
    );
  }
};

function refreshPage() {
  location.reload();
}
const AddUser = async (user) => {
  try {
    let accessToken = localStorage.getItem("accessToken");
    console.log(user);

    // Initial POST request
    let response = await fetch("https://beep-zlaa.onrender.com/api/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    // Retry logic if the response is 401
    if (response.status === 401) {
      console.log("Access token expired, attempting to refresh token");
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        console.error("Failed to refresh access token");
        return;
      }

      // Retry the POST request with the new access token
      response = await fetch("https://beep-zlaa.onrender.com/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
    }

    if (!response.ok) {
      throw new Error(
        "Add user request failed with status: " + response.status
      );
    }

    const responseData = await response.json();
    console.log("User added:", responseData);

    // Access the password from the response data
    const password = responseData.newUser.password;

    // Display the success alert with the password
    await new Promise((resolve) => {
      displayAlertsucceessuser(
        "success",
        "User Added!",
        `Password: ${password}`,
        "check",
        resolve
      );
    });

    // Refresh user data and close the popup
    await fetchUsers();
    closeEditProfilePopupnew();
    refreshPage();
  } catch (error) {
    console.error("Error adding user:", error);
    // Optionally display an error message
    displayAlert(
      "error",
      "Error",
      `Failed to add user: ${error.message}`,
      "error"
    );
  }
};

const applyBlackColor = () => {
  // Apply black color to all input and textarea elements
  document.querySelectorAll("input, textarea").forEach((element) => {
    element.style.color = "black"; // Set text color
    element.style.borderColor = "black"; // Set border color if needed
  });

  // Apply black color to all labels
  document.querySelectorAll("label").forEach((label) => {
    label.style.color = "black"; // Set label color
  });
};

// Call the function to apply the styles
applyBlackColor();
// Function to close the popup
const closePopup = () => {
  document.getElementById("edit-profile-popup").classList.add("hidden");
};

// Add event listener to the close button
document.getElementById("close-popup").addEventListener("click", closePopup);

// Optional: Close the popup when clicking outside of it
document.addEventListener("click", (event) => {
  const popup = document.getElementById("edit-profile-popup");
  if (event.target === popup) {
    closePopup();
  }
});

const formHTML = `
    <form id="add-user-form">
      <div class="tab-content" id="nav-tabContent">
        <div class="tab-pane active show" id="step1" role="tabpanel" aria-labelledby="step1-tab">
          <h4 class="card-title my-4 fs-15">Add New User</h4>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group row mb-2">
                <label for="new-firstname" class="col-lg-3 col-form-label text-end">Firstname</label>
                <div class="col-lg-9">
                  <input id="new-firstname" name="firstname" type="text" class="form-control" />
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group row mb-2">
                <label for="new-phone" class="col-lg-3 col-form-label text-end">Phone</label>
                <div class="col-lg-9">
                  <input id="new-phone" name="phone" type="text" class="form-control" />
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group row mb-2">
                <label for="new-lastname" class="col-lg-3 col-form-label text-end">Lastname</label>
                <div class="col-lg-9">
                  <input id="new-lastname" name="lastname" type="text" class="form-control" />
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group row mb-2">
                <label for="new-positionname" class="col-lg-3 col-form-label text-end">Position Name</label>
                <div class="col-lg-9">
                  <input id="new-positionname" name="positionname" type="text" class="form-control" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  `;

document
  .getElementById(`add-user-button`)
  .addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior
    showEditProfilePopupNew();
  });

document
  .getElementById("logout-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default link behavior

    // Remove tokens from local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Send logout request to the API
    fetch("https://beep-zlaa.onrender.com/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include any necessary headers, such as authorization tokens
      },
    })
      .then((response) => {
        if (response.ok) {
          // Redirect to sign-in page
          window.location.href = "sign-in.html";
        } else {
          // Handle logout error
          console.error("Logout failed");
        }
      })
      .catch((error) => {
        // Handle network errors
        console.error("Network error:", error);
      });
  });
