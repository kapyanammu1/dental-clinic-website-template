document.addEventListener('DOMContentLoaded', function() {
    const signUpUrl = 'http://localhost:8000/api/signup/';

    function showLoading(button) {
        button.setAttribute('data-kt-indicator', 'on');
        button.disabled = true;
    }

    // Function to hide loading indicator
    function hideLoading(button) {
        button.removeAttribute('data-kt-indicator');
        button.disabled = false;
    }

    document.getElementById('kt_sign_up_form').addEventListener('submit', function(event) {
        event.preventDefault();
        showLoading(document.getElementById('kt_sign_up_submit'));

        const newPatient = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            date_of_birth: document.getElementById('birthdate').value,
            gender: document.getElementById('gender').value,
            contact_number: document.getElementById('contact_no').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
            user_account: {
                username: document.querySelector('input[name="username"]').value,
                password1: document.querySelector('input[name="password1"]').value,
                password2: document.querySelector('input[name="password2"]').value,
                is_patient: true
            }
        };

        fetch(signUpUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPatient)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                text: "Account has been created successfully!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('kt_sign_up_form').reset();
                    hideLoading(document.getElementById('kt_sign_up_submit'));
                    window.location.href = 'sign-in.html';
                }
            });
        })
        .catch(error => {
            console.error("Error saving record:", error);
            Swal.fire({
                text: error.message || "There was an error. Please check your input.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
            hideLoading(document.getElementById('kt_sign_up_submit'));
        });
    });
});
