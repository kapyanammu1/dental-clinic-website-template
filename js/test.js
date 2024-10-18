$(document).ready(function() {
    const apiUrl = 'http://localhost:8000/api/patients/';

    // Function to fetch and display patients
    function fetchPatients() {
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                $('#patient-list').empty();
                data.forEach(function(patient) {
                    $('#patient-list').append(
                        `<li class="list-group-item">
                        <img src="${patient.image}" alt="Patient Image" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover; margin-right: 10px;">
                            ${patient.first_name} ${patient.last_name} (${patient.date_of_birth}, ${patient.gender})
                        </li>`
                    );
                });
            },
            error: function(error) {
                console.error("Error fetching patients:", error);
            }
        });
    }

    // Fetch patients on page load
    fetchPatients();

    // Handle form submission
    $('#patient-form').on('submit', function(event) {
        event.preventDefault();

        const newPatient = {
            first_name: $('#first_name').val(),
            last_name: $('#last_name').val(),
            date_of_birth: $('#birthdate').val(),
            gender: $('#gender').val(),
            contact_number: $('#contact_number').val(),
            address: $('#address').val(),
            email: $('#email').val()
        };

        $.ajax({
            url: apiUrl,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newPatient),
            success: function(response) {
                // Clear the form
                $('#patient-form')[0].reset();
                // Fetch the updated patient list
                fetchPatients();
                alert("Patient added successfully!");
            },
            error: function(error) {
                console.error("Error adding patient:", error);
                alert("Error adding patient!");
            }
        });
    });
});