// Create floating button
function createFloatingButton() {
    const container = document.createElement('div');
    container.className = 'gmail-copilot-container';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'gmail-copilot-buttons';
    
    // Create summarize button
    const summarizeBtn = document.createElement('button');
    summarizeBtn.className = 'gmail-copilot-btn';
    summarizeBtn.title = 'Summarize Email';
    summarizeBtn.innerHTML = `<img src="${chrome.runtime.getURL('summarize-icon.svg')}" alt="Summarize" width="24" height="24">`;
    summarizeBtn.addEventListener('click', () => handleButtonClick('summarize'));
    
    // Create draft reply button
    const draftBtn = document.createElement('button');
    draftBtn.className = 'gmail-copilot-btn';
    draftBtn.title = 'Draft Reply';
    draftBtn.innerHTML = `<img src="${chrome.runtime.getURL('draft-icon.svg')}" alt="Draft Reply" width="24" height="24">`;
    draftBtn.addEventListener('click', () => handleButtonClick('draft'));
    
    buttonsContainer.appendChild(summarizeBtn);
    buttonsContainer.appendChild(draftBtn);
    container.appendChild(buttonsContainer);
    document.body.appendChild(container);
}

// Create message UI for non-email pages
function createMessageUI() {
    const container = document.createElement('div');
    container.className = 'gmail-copilot-container';
    
    const message = document.createElement('div');
    message.className = 'gmail-copilot-message';
    message.textContent = 'Please open an email to access Email Copilot';
    
    container.appendChild(message);
    document.body.appendChild(container);
}

// Extract email content
function extractEmailContent() {
    const emailContent = document.querySelector('.a3s.aiL');
    if (!emailContent) return null;

    const subject = document.querySelector('h2.hP')?.textContent || '';
    const sender = document.querySelector('.gD')?.textContent || '';
    const body = emailContent.textContent || '';

    return {
        subject,
        sender,
        body
    };
}

// Extract email ID
function extractEmailId() {
    const emailId = document.querySelector('h2.hP')?.textContent || '';
    return emailId;
}

// Show instruction modal for draft reply
function showInstructionModal() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'gmail-copilot-modal';
        modal.innerHTML = `
            <div class="gmail-copilot-modal-content">
                <h3>Draft Reply Instructions</h3>
                <p>Add any specific instructions for the reply (optional):</p>
                <textarea placeholder="e.g., make it sound more casual, include product details, etc."></textarea>
                <div class="gmail-copilot-modal-buttons">
                    <button class="gmail-copilot-cancel-btn">Cancel</button>
                    <button class="gmail-copilot-submit-btn">Generate Reply</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const submitBtn = modal.querySelector('.gmail-copilot-submit-btn');
        const cancelBtn = modal.querySelector('.gmail-copilot-cancel-btn');
        const textarea = modal.querySelector('textarea');
        
        submitBtn.addEventListener('click', () => {
            const value = textarea.value.trim();
            modal.remove();
            resolve(value);
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            resolve(null);
        });
    });
}

// Handle button click
async function handleButtonClick(action) {
    try {
        const emailContent = extractEmailContent();
        if (!emailContent) {
            showError('Could not extract email content');
            return;
        }

        const emailId = extractEmailId();
        if (!emailId) {
            showError('Could not extract email ID');
            return;
        }

        // Determine API endpoint
        const endpoint = action === 'summarize' 
            ? 'http://localhost:8000/api/v1/summarize'
            : 'http://localhost:8000/api/v1/draft-reply';

        // Make API call
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                thread_content: emailContent.body,
                email_id: emailId,
                instruction: action === 'draft' ? await showInstructionModal() : undefined
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        showResponse(data.content, action);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

function showResponse(content, action) {
    const responseUI = document.createElement('div');
    responseUI.className = 'gmail-copilot-response';
    responseUI.innerHTML = `
        <div class="gmail-copilot-response-content">
            <h3>${action === 'summarize' ? 'Email Summary' : 'Suggested Reply'}</h3>
            <p>${content}</p>
            <button class="gmail-copilot-close">Close</button>
        </div>
    `;

    document.body.appendChild(responseUI);

    // Add close button handler
    const closeBtn = responseUI.querySelector('.gmail-copilot-close');
    closeBtn.addEventListener('click', () => responseUI.remove());
}

// Show error UI
function showError(message) {
    const errorUI = document.createElement('div');
    errorUI.className = 'gmail-copilot-error';
    errorUI.innerHTML = `
        <div class="gmail-copilot-error-content">
            <p>${message}</p>
            <button class="gmail-copilot-close">Close</button>
        </div>
    `;

    document.body.appendChild(errorUI);

    // Add close button handler
    const closeBtn = errorUI.querySelector('.gmail-copilot-close');
    closeBtn.addEventListener('click', () => errorUI.remove());
}

// Check if we're on an email detail page
function isEmailDetailPage() {
    return window.location.pathname.includes('/mail/u/0/') && 
           !window.location.pathname.includes('/inbox/');
}

// Initialize the extension
function init() {
    // Remove any existing UI
    const existingButton = document.querySelector('.gmail-copilot-container');
    const existingMessage = document.querySelector('.gmail-copilot-container');
    if (existingButton) existingButton.remove();
    if (existingMessage) existingMessage.remove();

    if (isEmailDetailPage()) {
        createFloatingButton();
    } else {
        createMessageUI();
    }
}

// Run initialization
init();

// Listen for URL changes (Gmail is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        init();
    }
}).observe(document, { subtree: true, childList: true }); 