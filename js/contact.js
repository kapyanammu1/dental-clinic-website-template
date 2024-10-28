async function handleSubmit(event) {
    event.preventDefault();

    // Get form elements
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    try {
        // Disable button and show spinner
        submitButton.disabled = true;
        submitText.textContent = 'Sending...';
        submitSpinner.classList.remove('d-none');
        const token = localStorage.getItem('access_token');

        // Send data to backend
        const response = await fetch('http://ec2-52-91-47-250.compute-1.amazonaws.com/api/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Show success message
        Swal.fire({
            title: 'Success!',
            text: 'Your message has been sent successfully.',
            icon: 'success',
            confirmButtonColor: '#0463FA'
        });

        // Reset form
        form.reset();

    } catch (error) {
        console.error('Error:', error);
        
        // Show error message
        Swal.fire({
            title: 'Error!',
            text: 'Failed to send message. Please try again later.',
            icon: 'error',
            confirmButtonColor: '#0463FA'
        });

    } finally {
        // Re-enable button and hide spinner
        submitButton.disabled = false;
        submitText.textContent = 'Send Message';
        submitSpinner.classList.add('d-none');
    }
}

// Optional: Add input validation
document.getElementById('contactForm').addEventListener('input', function(e) {
    const input = e.target;
    if (input.value.trim() === '') {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
});
