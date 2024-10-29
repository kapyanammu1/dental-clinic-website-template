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
        const refreshUrl = 'http://ec2-44-204-79-164.compute-1.amazonaws.com/api/token/refresh/'; 
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

    $('#appointment_form').on('submit', function(event) {
        event.preventDefault();
        const appointmentUrl = 'http://ec2-44-204-79-164.compute-1.amazonaws.com/api/appointment_client/'; 
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        const formData = new FormData();
        const appointmentDate = new Date(document.getElementById('appointment_date').value);
        const formattedDate = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD

        const startTime = document.getElementById('start_time').value;

        formData.append('dentist', $('#dentist').val());
        formData.append('treatment', $('#treatment').val());
        formData.append('appointment_date', formattedDate);
        formData.append('start_time', startTime);
        formData.append('notes', $('#notes').val());

        if (token) {
            $.ajax({
                url: appointmentUrl,
                type: 'POST',
                processData: false,  // Important for FormData
                contentType: false,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: formData,
                success: function(response) {
                    Swal.fire({
                        text: "Your appointment request has been sent successfully. Please hold tight while the dentist reviews and approves your booking.",
                        icon: "success",
                        buttonsStyling: !1,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    }).then((function(e) {
                        if (e.isConfirmed) {
                            window.location.reload();
                        }
                    }))
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
                        console.error("Error fetching data:", xhr);
                        console.error('Error creating appointment:', xhr.responseJSON); // Logs the error response
                        console.error('Status:', xhr.status); // Logs the status code (e.g., 400)
                        console.error('Response Text:', xhr.responseText); 
                    }
                    Swal.fire({
                        text: "There was an error. Please check your input." + xhr,
                        icon: "error",
                        buttonsStyling: !1,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }
            });
        }
    });

    function fetchTreatment() {
        const apiUrl = 'http://ec2-44-204-79-164.compute-1.amazonaws.com/api/treatments/';
        fetch(apiUrl, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            const treatmentSelect = document.getElementById('treatment');
            data.forEach(treatment => {
                const option = document.createElement('option');
                option.value = treatment.id;
                option.text = treatment.name;
                treatmentSelect.add(option);
            });
        })
        .catch(error => {
            console.error("Error fetching treatments:", error);
        });
    }

    function fetchDentist() {
        const apiUrl = 'http://ec2-44-204-79-164.compute-1.amazonaws.com/api/dentist/';
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                const dentistSelect = document.getElementById('dentist');
                data.forEach(dentist => {
                    const option = document.createElement('option');
                    option.value = dentist.id;
                    option.text = dentist.name;
                    dentistSelect.add(option);
                });
            },
            error: function(error) {
                console.error("Error fetching treatments:", error);
            }
        });
    }

    checkLoginStatus();
    fetchTreatment();
    fetchDentist();
});