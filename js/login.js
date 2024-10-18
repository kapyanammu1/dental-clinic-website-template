$(document).ready(function() {
    const loginUrl = 'http://localhost:8000/api/token/';  // Adjust the URL to match your backend login API

    $('#kt_sign_in_form').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission
        // Clear any previous errors
        $('.form-control').removeClass('is-invalid');
        // Gather form data
        const username = $('input[name="username"]').val();
        const password = $('input[name="password"]').val();

        $.ajax({
            url: loginUrl,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function(response) {
                // Save the access token and refresh token in local storage
                Swal.fire({
                    text: "You have successfully logged in!",
                    icon: "success",
                    buttonsStyling: !1,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                }).then((function() {
                    localStorage.setItem('access_token', response.access);
                    localStorage.setItem('refresh_token', response.refresh);
                    // console.log(localStorage.getItem('access_token'));
                    // console.log(localStorage.getItem('refresh_token'));
                    // Redirect the user upon successful login
                    window.location.href = $('#kt_sign_in_form').data('kt-redirect-url');
                }));
                
            },
            error: function(xhr, status, error) {
                const errorDetail = xhr.responseJSON.detail;
                console.log(errorDetail);
                if (errorDetail == "Please verify your email before logging in.") {
                    Swal.fire({
                        text: "Please check your email to verify your account.",
                        icon: "warning",
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
                $('input[name="username"]').addClass('is-invalid');
                $('input[name="password"]').addClass('is-invalid');
            }
        });
    });
});
