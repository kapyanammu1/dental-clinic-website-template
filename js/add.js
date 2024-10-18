"use strict";

var medicalModalForm = function() {
    var 
    submitButton, 
    cancelButton, 
    closeButton, 
    formValidation, 
    modalInstance, 
    formElement;

    return {
        init: function(modalName, formName) {
            modalInstance = new bootstrap.Modal(document.querySelector(`#${modalName}`)); // Initialize modal
            formElement = document.querySelector(`#${formName}`); // Get form element
            submitButton = formElement.querySelector("#btn-submit"); // Submit button
            cancelButton = formElement.querySelector("#btn-cancel"); // Cancel button
            closeButton = formElement.querySelector("#btn-close"); // Close button

            formValidation = FormValidation.formValidation(formElement, {
                fields: {
                    first_name: {
                        validators: {
                            notEmpty: {
                                message: "First name is required"
                            }
                        }
                    },
                    last_name: {
                        validators: {
                            notEmpty: {
                                message: "Last name is required"
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: "Email is required"
                            }
                        }
                    },
                    date_of_birth: {
                        validators: {
                            notEmpty: {
                                message: "Birthdate is required"
                            }
                        }
                    },
                    contact_number: {
                        validators: {
                            notEmpty: {
                                message: "Contact number is required"
                            }
                        }
                    },
                    address: {
                        validators: {
                            notEmpty: {
                                message: "Address is required"
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: ".fv-row",
                        eleInvalidClass: "",
                        eleValidClass: ""
                    })
                }
            });

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
                            window.location.href = 'sign-in.html';
                        }
                    });
                });
            }

            // Submit button event listener
            submitButton.addEventListener("click", function(event) {
                event.preventDefault();


                const AddUrl = 'http://localhost:8000/api/medical-history/';
                const token = localStorage.getItem('access_token');

                const formData = new FormData();
                formData.append('id', $('#id').val());
                formData.append('medical_condition', $('#medical_condition').val());
                formData.append('medications', $('#medications').val());
                formData.append('allergies', $('#allergies').val());
                formData.append('notes', $('#notes').val());
                console.log(formData);

                let post_type = $('#id').val() === "" ? 'POST' : 'PUT';

                // Check FormData (for debugging purposes)
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
    }
                $.ajax({
                    url: AddUrl,
                    type: post_type,
                    processData: false,  // Important for FormData
                    contentType: false,
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    data: formData,
                    success: function(response) {
                        Swal.fire({
                            text: "Medical History added successfully.",
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
                            // console.error("Access token expired, refreshing...");
                            refreshToken().then(() => {
                                fetchMedical_historyData();
                            }).catch((error) => {
                                console.error("Error refreshing token:", error);
                                // Handle logout or further actions
                            });
                        } else {
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
                    }
                });
            });

            // Cancel button event listener
            cancelButton.addEventListener("click", function(event) {
                event.preventDefault();

                Swal.fire({
                    text: "Are you sure you would like to cancel?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, cancel it!",
                    cancelButtonText: "No, return",
                    customClass: {
                        confirmButton: "btn btn-primary",
                        cancelButton: "btn btn-active-light"
                    }
                }).then(function(result) {
                    if (result.value) {
                        formElement.reset(); // Reset the form
                        modalInstance.hide(); // Hide the modal
                    } else if (result.dismiss === "cancel") {
                        Swal.fire({
                            text: "Your form has not been cancelled!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                });
            });

            // Close button event listener
            closeButton.addEventListener("click", function(event) {
                event.preventDefault();

                Swal.fire({
                    text: "Are you sure you would like to cancel?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, cancel it!",
                    cancelButtonText: "No, return",
                    customClass: {
                        confirmButton: "btn btn-primary",
                        cancelButton: "btn btn-active-light"
                    }
                }).then(function(result) {
                    if (result.value) {
                        formElement.reset(); // Reset the form
                        modalInstance.hide(); // Hide the modal
                    } else if (result.dismiss === "cancel") {
                        Swal.fire({
                            text: "Your form has not been cancelled!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                });
            });
        }
    };
}();

// KTUtil.onDOMContentLoaded(function() {
//     CustomerModalForm.init();
// });
