$(document).ready(function() {
    
    // Function to fetch and display patients
    function fetchTreatment() {
        const apiUrl = 'http://localhost:8000/api/treatments/';
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                $('#treatments').empty();
                data.forEach(function(treatment) {
                    $('#treatments').append(
                        `<div class="col-md-4 service-item wow zoomIn" data-wow-delay="0.6s">
                            <div class="rounded-top overflow-hidden">
                                <img class="fixed-size-image img-fluid" src="${treatment.image}" alt="">
                            </div>
                            <div class="position-relative bg-light rounded-bottom text-center p-4">
                                <h5 class="m-0">${treatment.name}</h5>
                            </div>
                        </div>`
                    );
                    // $('#treatment_carousel').empty();
                    $('#treatment_carousel').trigger('add.owl.carousel', `
                        <div class="price-item pb-4">
                            <div class="position-relative">
                                <img class="img-fluid rounded-top" src="${treatment.image}" alt="">
                                <div class="d-flex align-items-center justify-content-center bg-light rounded pt-2 px-3 position-absolute top-100 start-50 translate-middle" style="z-index: 2;">
                                    <h2 class="text-primary m-0">₱${treatment.cost}</h2>
                                </div>
                            </div>
                            <div class="position-relative text-center bg-light border-bottom border-primary py-5 p-4">
                                <h4>${treatment.name}</h4>
                                <hr class="text-primary w-50 mx-auto mt-0">
                                <div class="d-flex justify-content-between mb-3"><span>Modern Equipment</span><i class="fa fa-check text-primary pt-1"></i></div>
                                <div class="d-flex justify-content-between mb-3"><span>Professional Dentist</span><i class="fa fa-check text-primary pt-1"></i></div>
                                <div class="d-flex justify-content-between mb-2"><span>24/7 Call Support</span><i class="fa fa-check text-primary pt-1"></i></div>
                                <a href="appointment.html" class="btn btn-primary py-2 px-4 position-absolute top-100 start-50 translate-middle">Appointment</a>
                            </div>
                        </div>
                    `).trigger('refresh.owl.carousel'); 
                });
            },
            error: function(error) {
                console.error("Error fetching treatments:", error);
            }
        });
    }

    function fetchDentist() {
        const apiUrl = 'http://localhost:8000/api/dentist/';
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                $('#dentist').empty();
                $('#dentist').append(
                    `<div class="col-lg-4 wow slideInUp" data-wow-delay="0.1s">
                        <div class="section-title bg-light rounded h-100 p-5">
                            <h5 class="position-relative d-inline-block text-primary text-uppercase">Our Dentist</h5>
                            <h1 class="display-6 mb-4">Meet Our Certified & Experienced Dentist</h1>
                            <a href="appointment.html" class="btn btn-primary py-3 px-5">Appointment</a>
                        </div>
                    </div>`
                );

                data.forEach(function(a) {
                    $('#dentist').append(
                        `<div class="col-lg-4 wow slideInUp" data-wow-delay="0.3s">
                            <div class="team-item">
                                <div class="position-relative rounded-top" style="z-index: 1;">
                                    <img class="img-fluid rounded-top w-100" src="${a.image}" alt="">
                                    <div class="position-absolute top-100 start-50 translate-middle bg-light rounded p-2 d-flex">
                                        <a class="btn btn-primary btn-square m-1" href="#"><i class="fab fa-twitter fw-normal"></i></a>
                                        <a class="btn btn-primary btn-square m-1" href="#"><i class="fab fa-facebook-f fw-normal"></i></a>
                                        <a class="btn btn-primary btn-square m-1" href="#"><i class="fab fa-linkedin-in fw-normal"></i></a>
                                        <a class="btn btn-primary btn-square m-1" href="#"><i class="fab fa-instagram fw-normal"></i></a>
                                    </div>
                                </div>
                                <div class="team-text position-relative bg-light text-center rounded-bottom p-4 pt-5">
                                    <h4 class="mb-2">${a.name}</h4>
                                    <p class="text-primary mb-0">${a.specialty}</p>
                                </div>
                            </div>
                        </div>`
                    );
                });
            },
            error: function(error) {
                console.error("Error fetching treatments:", error);
            }
        });
    }

    fetchTreatment();
    fetchDentist()
});