$(document).ready(function() {
    function formatTimeStringTo12Hour(timeStr) {
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours, 10);
        
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format and handle '0' as '12'
        
        return hours + ':' + minutes + ' ' + ampm;
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
                    
                    $('#patient_name').html(
                        `${data.first_name} ${data.last_name}`
                    );
                    fetchInvoice_ItemsData();  // Retry after refreshing
                },
                error: function(xhr) {
                    if (xhr.status === 401) {
                        // console.error("Access token expired, refreshing...");
                        refreshToken().then(() => {
                            fetchPatientData();
                            fetchInvoice_ItemsData();  // Retry after refreshing
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

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function fetchInvoice_ItemsData() {
        const invoiceId = getQueryParam('invoiceId');
        const invoiceUrl = `http://localhost:8000/api/invoice_items/?invoiceId=${invoiceId}`;
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
                    console.log('Invoice Data:', data.invoice);
                    let grand_total = 0;
                    $('#invoice_table_body').empty();
                    const invoiceDate = new Date(data.invoice.invoice_date);
                    const formattedDate = invoiceDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    data.invoice_items.forEach(invoice => {
                        const total_price = invoice.qty * invoice.price;
                        grand_total += total_price;
                        $('#invoice_table_body').append(
                            `
                            <tr>
								<td>
									<div class="fw-bold">${invoice.treatment}</div>
								</td>
								<td class="text-end">${invoice.qty}</td>
								<td class="text-end">₱${invoice.price}</td>
                                <td class="text-end">₱${total_price}</td>
							</tr>
                            `
                        );
                    });
                    $('#invoice_number').text('Invoice #: ' + data.invoice.invoice_number);
                    $('#invoice_date').text(formattedDate);
                    $('#invoice_table_body').append(
                        `
                        <tr>
							<td colspan="3" class="fs-3 text-gray-900 fw-bold text-end">Grand Total</td>
							<td class="text-gray-900 fs-3 fw-bolder text-end">₱${grand_total}</td>
						</tr>
                        `
                    );
                    // Reinitialize dropdowns (if using Bootstrap)
                    $('#invoice_table_body [data-kt-menu="true"]').dropdown();
                },
                error: function(xhr) {
                    console.error("Error fetching data:", xhr);
                }
            });
        }
    }

    function fetchClinicInfo() {
        const apiUrl = 'http://localhost:8000/api/clinic-info/';
        console.log("asd");
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(data) {
                // Assuming data.image exists and contains the correct image URL
                    $('#clinic_address').html(
                        `<div>${data.clinic_address}</div>
						 <div>Philippines</div>`
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

    fetchPatientData();
    fetchClinicInfo();
});