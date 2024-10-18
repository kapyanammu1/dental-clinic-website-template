$(document).ready(function() {

    function formatTimeStringTo12Hour(timeStr) {
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours, 10);
        
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format and handle '0' as '12'
        
        return hours + ':' + minutes + ' ' + ampm;
    }

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
                    window.location.href = 'sign-in.html';
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
                    const imageWrapper = document.querySelector('.image-input-wrapper');
                    const first_name = document.querySelector('.first-name');
                    const last_name = document.querySelector('.last-name');
                    const gender = document.querySelector('.gender');
                    const birthdate = document.querySelector('.birthdate');
                    const contact_no = document.querySelector('.contact-no');
                    const email = document.querySelector('.email');
                    const address = document.querySelector('.address');

                    first_name.value = `${data.first_name}`;
                    last_name.value = `${data.last_name}`;
                    gender.value = `${data.gender}`;
                    birthdate.value = `${data.date_of_birth}`;
                    contact_no.value = `${data.contact_number}`;
                    email.value = `${data.email}`;
                    address.value = `${data.address}`;

                    $('#display_name').html(
                        `${data.first_name} ${data.last_name}`
                    );

                    $('#display_email').html(
                        `${data.email}`
                    );

                    if (data.image) {
                        $('#display_picture').html(
                            `<img src="${data.image}?height=150&width=150" alt="image" class="rounded-circle profile-image mb-3" />`
                        );
                        // imageWrapper.style.backgroundImage = `url(${data.image})`;
                        $('#profile-picture').html(
                            `<img src="${data.image}?height=150&width=150" alt="Profile" class="profile-image me-3" id="profile-image">`
                        );
                    } else {
                        $('#display_picture').html(
                            `<img src="img/default.jpg?height=150&width=150" alt="user" class="rounded-circle profile-image mb-3" />`
                        );
                        // imageWrapper.style.backgroundImage = `url(${data.image})`;
                    }
                    
                    $('#patient_name').html(
                        `${data.first_name} ${data.last_name}`
                    );
                    $('#patient_email').html(
                        `${data.email}`
                    );
                    fetchMedical_historyData();
                    fetchInvoiceData();  // Retry after refreshing
                    fetchAppointmentData();
                },
                error: function(xhr) {
                    if (xhr.status === 401) {
                        // console.error("Access token expired, refreshing...");
                        refreshToken().then(() => {
                            fetchPatientData();
                            fetchMedical_historyData();
                            fetchInvoiceData();  // Retry after refreshing
                            fetchAppointmentData();
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

    function fetchMedical_historyData() {
        const medhisUrl = 'http://localhost:8000/api/medical-history/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        if (token) {
            $.ajax({
                url: medhisUrl,
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(data) {
                    
                    $('#medhis_table_body').empty();
                    data.forEach(medhis => {                             
                        $('#medhis_table_body').append(
                            `<tr id="medhis_row_${medhis.id}" data-pk="${medhis.id}">
                                <td>${medhis.medical_condition}</td>
                                <td>${medhis.medications}</td>
                                <td>${medhis.allergies}</td>
                                <td>${medhis.notes}</td>
                                <td class="text-end">
                                <button class="edit-btn btn btn-sm btn-light btn-flex btn-center btn-active-light-primary" 
                                    data-formid1="MedicalHistoryForm" 
                                    data-id="${medhis.id}" 
                                    data-medical_condition="${medhis.medical_condition}" 
                                    data-medications="${medhis.medications}" 
                                    data-allergies="${medhis.allergies}"
                                    data-notes="${medhis.notes}"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#add_medical_modal"
                                    id="edit_btn">Edit
                                </button>
                                <button class="delete-btn btn btn-sm btn-light btn-flex btn-center btn-active-light-primary" 
                                    data-id="${medhis.id}" 
                                    data-kt-customer-table-filter="delete_row">Delete
                                </button>
                                </td>
                            </tr>`
                        );
                    });
                },
                error: function(xhr) {
                    console.error("Error fetching data:", xhr);
                }
            });
        }
    }

    function fetchInvoiceData() {
        const invoiceUrl = 'http://localhost:8000/api/invoices/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }
    
        if (token) {
            $.ajax({
                url: invoiceUrl,
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(data) {
                    
                    $('#invoice_table_body').empty();
                    data.forEach(invoice => {
                        let paidclass = "";
                        let paidText = "";

                        // Determine the badge class and text based on the payment status
                        if (invoice.paid == true) {
                            paidclass = "badge badge-light-success";
                            paidText = "PAID";
                        } else {
                            paidclass = "badge badge-light-danger";
                            paidText = "NOT PAID";
                        }

                        const invoiceDate = new Date(invoice.invoice_date);
                        const formattedDate = invoiceDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                                            
                        $('#invoice_table_body').append(
                            `<tr data-id="${invoice.id}">
                                <td>${invoice.invoice_number}</td>
                                <td>${invoice.total_sum}</td>
                                <td class="pe-0" data-order="Completed">
                                    <div class="${paidclass}">${paidText}</div>
                                </td>
                                <td>${formattedDate}</td>
                                <td class="text-end">
                                    <button class="view-btn btn btn-sm btn-light btn-flex btn-center btn-active-light-primary" 
                                        data-id="${invoice.id}" 
                                        data-kt-customer-table-filter="delete_row">View Details
                                    </button>
                                </td>
                            </tr>`
                        );
                    });
                    // Reinitialize dropdowns (if using Bootstrap)
                    $('#invoice_table_body [data-kt-menu="true"]').dropdown();
                },
                error: function(xhr) {
                    console.error("Error fetching data:", xhr);
                }
            });
        }
    }

    function fetchAppointmentData() {
        const medhisUrl = 'http://localhost:8000/api/appointment_client/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        if (token) {
            $.ajax({
                url: medhisUrl,
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(data) {
                    $('#total_appointments').html(`Total of ${data.length} appointment/s`);

                    $('#appointment-list').empty();
                    if (data && data.length > 0) {
                        data.forEach(appointment => {     
                            const appointmentDate = new Date(appointment.appointment_date);
                            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                            $('#appointment-list').append(
                                `<div class="d-flex align-items-center position-relative mb-7">
                                    <div class="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                                    <div class="fw-semibold ms-5">
                                        <a href="#" class="fs-5 fw-bold text-gray-900 text-hover-primary">appointment with ${appointment.dentist_name}</a>
                                        <div class="fs-7 text-muted">${formattedDate}</div>
                                        <div>${formatTimeStringTo12Hour(appointment.start_time)} - ${formatTimeStringTo12Hour(appointment.end_time)}</div>
                                    </div>						
                                 </div>
                                `
                            );
                        });
                    } else {
                        $('#appointment-list').append('<p>No appointments found.</p>');
                    }
                    
                },
                error: function(xhr) {
                    console.error("Error fetching data:", xhr);
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
                        `<h1 class="m-0 text-primary"><i class="fa fa-tooth me-2"></i>${data.clinic_name}</h1>`
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

    $('#add-btn').click(function(event) {
        event.preventDefault(); // Prevent the default action of the link (which would be navigating away)
        $('#medical_form')[0].reset();
    });

    $('#medhis_table_body').on('click', '.edit-btn', function(event) {
        event.preventDefault();
        const id = $(this).data('id');
        const medicalCondition = $(this).data('medical_condition');
        const medications = $(this).data('medications');
        const allergies = $(this).data('allergies');
        const notes = $(this).data('notes');
        
        // Populate the modal form with the fetched data
        $('#id').val(id);
        $('#medical_condition').val(medicalCondition);
        $('#medications').val(medications);
        $('#allergies').val(allergies);
        $('#notes').val(notes);
    }); 

    $('#medhis_table_body').on('click', '.delete-btn', function(event) {
        event.preventDefault();
        const tableRow = event.target.closest("tr")
        const medhisId = $(this).data('id');  // Get the ID of the medical history record from a data attribute
        const deleteUrl = `http://localhost:8000/api/medical-history/`;  // Adjust this to your API's endpoint
        const token = localStorage.getItem('access_token');

        Swal.fire({
            text: "Are you sure you want to delete this record?",
            icon: "warning",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: "Yes, delete!",
            cancelButtonText: "No, cancel",
            customClass: {
                confirmButton: "btn fw-bold btn-danger",
                cancelButton: "btn fw-bold btn-active-light-primary"
            }
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: "DELETE",
                    url: deleteUrl,
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({ id: medhisId }),
                    success: function() {
                        Swal.fire({
                            text: "You have deleted the record successfully!!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary"
                            }
                        }).then(() => {
                            $(`#medhis_row_${medhisId}`).remove();
                        });
                    },
                    error: function() {
                        Swal.fire({
                            text: "Error deleting the record.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary"
                            }
                        });
                    }
                });
                
            } else if (result.dismiss === "cancel") {
                Swal.fire({
                    text: " Record was not deleted.",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn fw-bold btn-primary"
                    }
                });
            }
        });
    }); 

    $('#invoice_table_body').on('click', '.view-btn', function(event) {
        event.preventDefault();
        const invoiceID = $(this).data('id');
        window.open(`invoice.html?invoiceId=${invoiceID}`, '_blank');
    }); 

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

    $('#patient-form').on('submit', function(event) {
        event.preventDefault();
        const updateUrl = 'http://localhost:8000/api/patients/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        const formData = new FormData();
        formData.append('image', $('#photo-upload')[0].files[0]); // Get the file input
        formData.append('first_name', $('#first_name').val());
        formData.append('last_name', $('#last_name').val());
        formData.append('date_of_birth', $('#birthdate').val());
        formData.append('gender', $('#gender').val());
        formData.append('contact_number', $('#contact_no').val());
        formData.append('address', $('#address').val());
        formData.append('email', $('#email').val());

        $.ajax({
            url: updateUrl,
            type: 'PUT',
            processData: false,  // Important for FormData
            contentType: false,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: formData,
            success: function(response) {
                Swal.fire({
                    text: "Profile updated successfully.",
                    icon: "success",
                    buttonsStyling: !1,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                }).then((function(e) {
                    if (e.isConfirmed) {
                        fetchPatientData();
                    }
                }))
            },
            error: function(error) {
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

    $('#medical_form').on('submit', function(event) {
        event.preventDefault();
        console.log("asdasd");
        const AddUrl = 'http://localhost:8000/api/medical-history/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        const formData = new FormData();
        formData.append('id', $('#id').val());
        formData.append('medical_condition', $('#medical_condition').val());
        formData.append('medications', $('#medications').val());
        formData.append('allergies', $('#allergies').val());
        formData.append('notes', $('#notes').val());

        let post_type = $('#id').val() === "" ? 'POST' : 'PUT';

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
            error: function(error) {
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

    document.getElementById('photo-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-image').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    checkLoginStatus();
    fetchPatientData();
    fetchClinicInfo();
});