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
        const refreshUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/token/refresh/';
        const refreshToken = localStorage.getItem('refresh_token');
    
        return new Promise((resolve, reject) => {
            if (!refreshToken) {
                reject("No refresh token available.");
                return;
            }
    
            fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Save the new access token and resolve the promise
                localStorage.setItem('access_token', data.access);
                resolve();
            })
            .catch(error => {
                reject("Failed to refresh token.");
                window.location.href = 'sign-in.html';
            });
        });
    }
    
    function fetchPatientData() {
        const apiUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/patients/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }
    
        if (token) {
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
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

                document.getElementById('display_name').innerHTML = `${data.first_name} ${data.last_name}`;
                document.getElementById('display_email').innerHTML = `${data.email}`;

                if (data.image) {
                    document.getElementById('display_picture').innerHTML = 
                        `<img src="${data.image}?height=150&width=150" alt="image" class="rounded-circle profile-image mb-3" />`;
                    document.getElementById('profile-picture').innerHTML = 
                        `<img src="${data.image}?height=150&width=150" alt="Profile" class="profile-image me-3" id="profile-image">`;
                } else {
                    document.getElementById('display_picture').innerHTML = 
                        `<img src="img/default.jpg?height=150&width=150" alt="user" class="rounded-circle profile-image mb-3" />`;
                }
                
                // document.getElementById('patient_name').innerHTML = `${data.first_name} ${data.last_name}`;
                // document.getElementById('patient_email').innerHTML = `${data.email}`;

                fetchMedical_historyData();
                fetchInvoiceData();
                fetchAppointmentData();
            })
            .catch(error => {
                if (error.message === 'Network response was not ok' && error.response && error.response.status === 401) {
                    // Token expired, refresh and retry
                    refreshToken().then(() => {
                        fetchPatientData();
                        fetchMedical_historyData();
                        fetchInvoiceData();
                        fetchAppointmentData();
                    }).catch((refreshError) => {
                        console.error("Error refreshing token:", refreshError);
                        document.getElementById('user-dropdown').style.display = 'none';
                        document.getElementById('btn-sign_in').style.display = 'block';
                    });
                } else {
                    console.error("Error fetching patient data:", error);
                }
            });
        }
    }

    function fetchMedical_historyData() {
        const medhisUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/medical-history/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        if (token) {
            fetch(medhisUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
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
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });

            
        }
    }

    function fetchInvoiceData() {
        const invoiceUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/invoices/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }
    
        if (token) {
            fetch(invoiceUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
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
                $('#invoice_table_body [data-kt-menu="true"]').dropdown();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
        }
    }

    function fetchAppointmentData() {
        const appointmentUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/appointment_client/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        if (token) {
            fetch(appointmentUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update the total appointments count
                $('#total_appointments').html(`Total ${data.length} appointment${data.length !== 1 ? 's' : ''}`);

                // Clear existing appointments
                $('#appointment-list').empty();

                // Add each appointment
                data.forEach(appointment => {
                    const appointmentDate = new Date(appointment.appointment_date);
                    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                let statusClass = "";
                let statusText = "";
                switch(appointment.status) {
                    case 'Pending':
                        statusClass = "badge badge-light-primary";
                        statusText = "Upcoming";
                        break;
                    case 'Completed':
                        statusClass = "badge badge-light-success";
                        statusText = "Completed";
                        break;
                    case 'Approved':
                        statusClass = "badge badge-light-success";
                        statusText = "Approved";
                        break;
                    case 'Cancelled':
                        statusClass = "badge badge-light-danger";
                        statusText = "Cancelled";
                        break;
                    default:
                        statusClass = "badge badge-light-warning";
                        statusText = appointment.status;
                }
                    
                    $('#appointment-list').append(`
                        <div class="card card-flush mb-5">
                            <div class="card-body">
                                <h5 class="card-title fw-bold mb-1">Appointment with ${appointment.dentist_name}</h5>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p class="text-muted mb-0">${formattedDate}</p>
                                        <p class="text-muted mb-0">
                                            ${formatTimeStringTo12Hour(appointment.start_time)} - ${formatTimeStringTo12Hour(appointment.end_time)}
                                        </p>
                                    </div>
                                    <span>${statusText}</span>
                                </div>
                            </div>
                        </div>
                    `);
                });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
        }
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
        const medhisId = $(this).data('id'); 
        const deleteUrl = `http://ec2-52-91-47-250.compute-1.amazonaws.com/api/medical-history/`;
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
                fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: medhisId })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    // Check if the response has content before parsing JSON
                    return response.text().then(text => text ? JSON.parse(text) : {});
                })
                .then(() => {
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
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        text: "Error deleting the record: " + error.message,
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary"
                        }
                    });
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
    
                window.location.href = 'index.html';
            }
        });
    });

    $('#patient-form').on('submit', function(event) {
        event.preventDefault();
        const updateUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/patients/';
        const token = localStorage.getItem('access_token');

        if (!token) {
            console.error("No access token found. Redirect to login.");
            return;
        }

        const formData = new FormData();
        formData.append('image', $('#photo-upload')[0].files[0]);
        formData.append('first_name', $('#first_name').val());
        formData.append('last_name', $('#last_name').val());
        formData.append('date_of_birth', $('#birthdate').val());
        formData.append('gender', $('#gender').val());
        formData.append('contact_number', $('#contact_no').val());
        formData.append('address', $('#address').val());
        formData.append('email', $('#email').val());

        fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            Swal.fire({
                text: "Profile updated successfully.",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    fetchPatientData();
                }
            });
        })
        .catch(error => {
            Swal.fire({
                text: "There was an error. Please check your input.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        });
    });

    $('#medical_form').on('submit', function(event) {
        event.preventDefault();
        console.log("asdasd");
        const AddUrl = 'http://ec2-52-91-47-250.compute-1.amazonaws.com/api/medical-history/';
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

        fetch(AddUrl, {
            method: post_type,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            Swal.fire({
                text: "Medical History added successfully.",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        })
        .catch(error => {
            Swal.fire({
                text: "There was an error. Please check your input.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok, got it!",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
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
});
