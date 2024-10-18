$(document).ready(function() {
    function checkLoginStatus() {
        const token = localStorage.getItem('access_token');
        
        
        if (token) {
            // If token exists, show the dropdown
            $('#user-dropdown').show();
            $('#btn-sign_in').hide();
        } else {
            // If token does not exist, hide the dropdown
            $('#user-dropdown').hide();
            $('#btn-sign_in').show();
        }
    }

    function refreshToken() {
        const refreshUrl = 'http://localhost:8000/api/token/refresh/';
        const refreshToken = localStorage.getItem('refresh_token');
    
        return new Promise((resolve, reject) => {
            if (!refreshToken) {
                reject("No refresh token available.");
                return;
            }
    
            $.ajax({
                url: refreshUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    refresh: refreshToken
                }),
                success: function(response) {
                    // Save the new access token and resolve the promise
                    localStorage.setItem('access_token', response.access);
                    resolve();
                },
                error: function(xhr) {
                    reject("Failed to refresh token.");
                    
                }
            });
        });
    }

    function fetchPatientData() {
        const apiUrl = 'http://localhost:8000/api/patients/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }
    
        if (token) {
            $.ajax({
                url: apiUrl,
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(data) {
                    // Assuming data.image exists and contains the correct image URL
                    if (data.image) {
                        $('#profile_picture').html(
                            `<img src="${data.image}" alt="My Profile" />`
                        );
                        $('#profile_picture1').html(
                            `<img src="${data.image}" alt="user" />`
                        );
                    } else {
                        $('#profile_picture').html(
                            `<img src="img/default.jpg" alt="user" />`
                        );
                        $('#profile_picture1').html(
                            `<img src="img/default.jpg" alt="user" />`
                        );
                    }
                    $('#patient_name').html(
                        `${data.first_name} ${data.last_name}`
                    );
                    $('#patient_email').html(
                        `${data.email}`
                    );
                    
                },
                error: function(xhr) {
                    if (xhr.status === 401) {
                        console.error("Access token expired, refreshing...");
                        refreshToken().then(() => {
                            fetchPatientData();  // Retry after refreshing
                        }).catch((error) => {
                            console.error("Error refreshing token:", error);
                            
                            $('#user-dropdown').hide();
                            $('#btn-sign_in').show();
                        });
                    } else {
                        console.error("Error fetching patient data:", xhr);
                        
                    }
                }
            });
        }
    }

    function fetchClinicInfo() {
        const apiUrl = 'http://localhost:8000/api/clinic-info/';

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                // Assuming data.image exists and contains the correct image URL
                    $('#openingHrs').html(
                        `<small class="py-2"><i class="far fa-clock text-primary me-2"></i>Opening Hours: ${data.open_hours} </small>`
                    );
                    $('#clinic_email').html(
                        `<p class="m-0"><i class="fa fa-envelope-open me-2"></i>${data.email}</p>`
                    );
                    $('#clinic_contact').html(
                        `<p class="m-0"><i class="fa fa-phone-alt me-2"></i>${data.contact_no}</p>`
                    );
                    $('#clinic_name').html(
                        `<i class="fa fa-tooth me-2"></i>${data.clinic_name}`
                    );
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    console.error("Access token expired, refreshing...");
                    refreshToken().then(() => {
                        fetchPatientData();  // Retry after refreshing
                    }).catch((error) => {
                        console.error("Error refreshing token:", error);
                        // Handle logout or further actions
                    });
                } else {
                    console.error("Error fetching patient data:", xhr);
                }
            }
        });
    }

    $('#btn_signout').click(function(event) {
        event.preventDefault(); // Prevent the default action of the link (which would be navigating away)
        Swal.fire({
            text: "Are you sure you want to sign out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, sign out",
            cancelButtonText: "No, stay logged in",
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-secondary"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear tokens from local storage
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
    
                window.location.href = 'index.html';  // Adjust this URL based on your app's routing
            }
        });
    });

    checkLoginStatus();
    fetchPatientData();
    fetchClinicInfo();
});