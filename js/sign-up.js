$(document).ready(function() {
    const signUpUrl = 'http://localhost:8000/api/signup/';

    // Handle form submission
    $('#kt_sign_up_form').on('submit', function(event) {
        event.preventDefault();

        const newPatient = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            date_of_birth: $('#birthdate').val(),
            gender: $('#gender').val(),
            contact_number: $('#contact_no').val(),
            address: $('#address').val(),
            email: $('#email').val(),
            user_account: {
                username: $('input[name="username"]').val(),
                password1: $('input[name="password1"]').val(),
                password2: $('input[name="password2"]').val()
            }
        };

        const token = localStorage.getItem('access_token');
        $.ajax({
            url: signUpUrl,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newPatient),
            success: function(response) {
                Swal.fire({
                    text: "Account has been created successfully!",
                    icon: "success",
                    buttonsStyling: !1,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                }).then((function(e) {
                    if (e.isConfirmed) {
                        $('#kt_sign_up_form')[0].reset();
                        window.location.href = 'sign-in.html';
                    }
                }))
            },
            error: function(xhr) {
                console.error("Error saving record:", xhr);
                Swal.fire({
                    text: "There was an error. Please check your input.",
                    icon: "error",
                    buttonsStyling: !1,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            }
        });
    });
});