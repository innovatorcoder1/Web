// --- Configuration ---
// ** CRITICAL: Replace this with the actual URL provided by your n8n Webhook node. **
const N8N_WEBHOOK_URL = 'https://codewarcollege.app.n8n.cloud/webhook-test/5c27a646-48e0-4816-b6fb-34230c43ea5e'; 
// Example: 'https://webhook.n8n.cloud/v1/webhook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

// --- Element Selection ---
const form = document.getElementById('registration-form');
const messageStatus = document.getElementById('message-status');
const registerButton = document.querySelector('.registerbtn');

/**
 * Helper function to update the user message status
 * @param {string} message - The text to display
 * @param {string} className - The CSS class for styling ('success', 'error', 'processing')
 */
function updateStatus(message, className) {
    messageStatus.textContent = message;
    // Clear existing classes and add the new one
    messageStatus.className = ''; 
    messageStatus.classList.add(className);
}

/**
 * Main function to handle the form submission
 */
form.addEventListener('submit', async function(event) {
    // 1. Prevent the default page reload
    event.preventDefault(); 

    updateStatus('Sending data to the AI agent...', 'processing');
    registerButton.disabled = true; // Disable button to prevent double submission

    try {
        // 2. Collect Form Data
        const formData = new FormData(form);
        
        // Convert FormData to a plain JavaScript object (JSON payload)
        // The keys will be the 'name' attributes from the HTML inputs (fname, email, psw, query)
        const payload = Object.fromEntries(formData); 
        
        // ** Security Note: Sending the password directly is insecure. 
        // In a production app, you would hash it on the client or, more commonly, 
        // submit it to a dedicated user authentication server first. 
        // For this AI agent integration, we'll send all fields as requested. **
        
        console.log('Sending payload:', payload);

        // 3. Send POST Request using fetch API
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST', // Use POST method to send data
            headers: {
                'Content-Type': 'application/json' // Tell the server we are sending JSON
            },
            body: JSON.stringify(payload) // Convert the JavaScript object to a JSON string
        });

        // 4. Handle Response Status
        if (response.ok) {
            // The n8n webhook returned a successful status (200-299)
            // Optionally, you can read the response body from n8n:
            // const responseData = await response.json(); 
            
            updateStatus('✅ Registration & Query Successful! The AI agent is processing your request.', 'success');
            form.reset(); // Clear the form fields upon success

        } else {
            // Server responded but with an error status (e.g., 4xx or 5xx)
            updateStatus(`❌ Submission Failed. Server Status: ${response.status}. Please check the n8n webhook logs.`, 'error');
            
            // Log full error details for debugging
            try {
                const errorData = await response.text();
                console.error('Server Error Response:', errorData);
            } catch (e) {
                console.error('Could not parse error response text.', e);
            }
        }

    } catch (error) {
        // Catch network errors (CORS, network unreachable, invalid URL, etc.)
        updateStatus('❌ Network Error: Could not connect to the webhook. Check the URL and CORS settings.', 'error');
        console.error('Fetch Error:', error);

    } finally {
        // This runs regardless of success or failure
        registerButton.disabled = false; // Re-enable the button
    }

});

