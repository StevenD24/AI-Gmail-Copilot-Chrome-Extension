// Create floating button for detailed email pages
function createFloatingButton() {
    const container = document.createElement('div');
    container.className = 'gmail-copilot-container';
  
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'gmail-copilot-buttons';
  
    // Create summarize button
    const summarizeBtn = document.createElement('button');
    summarizeBtn.className = 'gmail-copilot-btn';
    summarizeBtn.title = 'Summarize Email';
    summarizeBtn.innerHTML = `
          <div class="btn-content">
              <img src="${chrome.runtime.getURL('summarize-icon.svg')}" alt="Summarize" width="24" height="24">
              <span>Summarize</span>
          </div>
      `;
    summarizeBtn.addEventListener('click', () => handleButtonClick('summarize'));
  
    // Create draft reply button
    const draftBtn = document.createElement('button');
    draftBtn.className = 'gmail-copilot-btn';
    draftBtn.title = 'Draft Reply';
    draftBtn.innerHTML = `
          <div class="btn-content">
              <img src="${chrome.runtime.getURL('draft-icon.svg')}" alt="Draft Reply" width="24" height="24">
              <span>Draft Reply</span>
          </div>
      `;
    draftBtn.addEventListener('click', () => handleButtonClick('draft'));
  
    buttonsContainer.appendChild(summarizeBtn);
    buttonsContainer.appendChild(draftBtn);
    container.appendChild(buttonsContainer);
    document.body.appendChild(container);
  }
  
  // Create floating button for non-email pages
  function createMessageUI() {
    const container = document.createElement('div');
    container.className = 'gmail-copilot-container';
  
    // Create a single circular icon button
    const button = document.createElement('button');
    button.className = 'gmail-copilot-btn circular disabled';
    button.title = 'Please open an email to access Email Copilot';
    button.innerHTML = `
          <div class="btn-content">
              <img src="${chrome.runtime.getURL('copilot-icon.svg')}" alt="Email Copilot" width="28" height="28">
          </div>
      `;
  
    container.appendChild(button);
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
  
  // Show loading state with enhanced styling
  function showLoading(message = 'Processing...') {
    const loadingUI = document.createElement('div');
    loadingUI.className = 'gmail-copilot-loading fade-in';
    loadingUI.innerHTML = `
          <div class="gmail-copilot-loading-content">
              <div class="spinner"></div>
              <p>${message}</p>
          </div>
      `;
    document.body.appendChild(loadingUI);
    return loadingUI;
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
  
  // Handle button click for both actions
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
  
        let instruction;
        if (action === 'draft') {
            instruction = await showInstructionModal();
            if (instruction === null) return; // User cancelled
        }
  
        // Show loading state immediately
        const loadingUI = showLoading(
            action === 'summarize' ? 'Generating summary...' : 'Drafting reply...'
        );
  
        // Make API call
        const response = await fetch(
            `http://localhost:8000/api/v1/${action === 'summarize' ? 'summarize' : 'draft-reply'}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    thread_content: emailContent.body,
                    email_id: emailId,
                    instruction: instruction
                })
            }
        );
  
        // Remove loading state
        loadingUI.remove();
  
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 500 && errorData.detail?.includes('OpenAI')) {
                throw new Error('LLM request failed');
            } else {
                throw new Error(`Request failed: ${errorData.detail || response.statusText}`);
            }
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
  
  function showError(message, type = 'generic') {
    const errorUI = document.createElement('div');
    errorUI.className = `gmail-copilot-error ${type}`;
    
    let displayMessage = message;
    // Handle specific error types
    if (message.includes('OpenAI') || message.includes('LLM')) {
        displayMessage = 'LLM request failed—please try again';
        type = 'llm-error';
    } else if (message.includes('fetch') || message.includes('network')) {
        displayMessage = 'Network error—please check your connection';
        type = 'network-error';
    }

    errorUI.innerHTML = `
        <div class="gmail-copilot-error-content ${type}">
            <p>${displayMessage}</p>
            <button class="gmail-copilot-close">Close</button>
        </div>
    `;
    document.body.appendChild(errorUI);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        errorUI.classList.add('fade-out');
        setTimeout(() => errorUI.remove(), 500); // Remove after fade animation
    }, 5000);

    // Add close button handler
    const closeBtn = errorUI.querySelector('.gmail-copilot-close');
    closeBtn.addEventListener('click', () => {
        errorUI.classList.add('fade-out');
        setTimeout(() => errorUI.remove(), 500);
    });
  }
  
  // Check if we're on a detailed email page by verifying the presence of email content
  function isEmailDetailPage() {
    if (!window.location.pathname.includes('/mail/u/')) return false;
    return !!document.querySelector('.a3s.aiL');
  }
  
  let lastUrl = location.href;
  let lastDetailPage = isEmailDetailPage();
  
  // Initialize the extension UI
  function init() {
    // Remove all existing UI elements
    document.querySelectorAll('.gmail-copilot-container').forEach(el => el.remove());
  
    if (isEmailDetailPage()) {
      createFloatingButton();
    } else {
      createMessageUI();
    }
  }
  
  // Initial run
  init();
  
  // Helper function to check for URL or state changes
  function checkForChanges() {
    const currentUrl = location.href;
    const currentDetailPage = isEmailDetailPage();
    if (currentUrl !== lastUrl || currentDetailPage !== lastDetailPage) {
      lastUrl = currentUrl;
      lastDetailPage = currentDetailPage;
      init();
    }
  }
  
  // Use queueMicrotask to schedule checkForChanges after mutations
  let isTaskQueued = false;
  new MutationObserver(() => {
    if (!isTaskQueued) {
      isTaskQueued = true;
      queueMicrotask(() => {
        checkForChanges();
        isTaskQueued = false;
      });
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Also listen for popstate and hashchange events for URL changes
  window.addEventListener('popstate', checkForChanges);
  window.addEventListener('hashchange', checkForChanges);
  