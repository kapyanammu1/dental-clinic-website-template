document.addEventListener('DOMContentLoaded', function() {
    const loginUrl = 'http://localhost:8000/api/token/';  // Adjust the URL to match your backend login API

    document.getElementById('kt_sign_in_form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        // Clear any previous errors
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
        // Gather form data
        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;

        fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw errorData;
                });
            }
            return response.json();
        })
        .then(data => {

            if (data.patient_id) {
                if (data.is_verified) { 
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('patient_id', data.patient_id);
                    localStorage.setItem('patient_name', data.patient_name);

                    Swal.fire({
                        text: "You have successfully logged in!",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    }).then(function() {
                        // Redirect the user upon successful login
                        window.location.href = document.getElementById('kt_sign_in_form').dataset.ktRedirectUrl;
                    });
                } else {
                    // Email is not verified
                    Swal.fire({
                        text: "Please verify your email before logging in.",
                        icon: "warning",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }   
            } else {
                // If patient_id is not in the response, it's not a patient account
                Swal.fire({
                    text: "You do not have permission to access this system.",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                }); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const errorDetail = error.detail;
            if (errorDetail === "Please verify your email before logging in.") {
                Swal.fire({
                    text: "Please check your email to verify your account.",
                    icon: "warning",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            } else if (errorDetail === "You do not have permission to access this system.") {
                Swal.fire({
                    text: "Only patients can log in to this system.",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            } else {
                // Handle other login errors (e.g., incorrect credentials)
                Swal.fire({
                    text: "Invalid username or password. Please try again.",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            }
            // Display error messages or add invalid classes to the form fields
            document.querySelector('input[name="username"]').classList.add('is-invalid');
            document.querySelector('input[name="password"]').classList.add('is-invalid');
        });
    });
});
