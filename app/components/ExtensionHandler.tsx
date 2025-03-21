'use client';

import { useEffect, useState } from 'react';

interface EmailData {
    thread_content: string;
    email_id: string;
    subject: string;
    sender: string;
}

export default function ExtensionHandler() {
    const [emailData, setEmailData] = useState<EmailData | null>(null);
    const [action, setAction] = useState<'summarize' | 'draft' | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Listen for messages from the extension
        const handleMessage = (message: any) => {
            if (message.type === 'EMAIL_ACTION') {
                setEmailData(message.data);
                setAction(message.action);
            }
        };

        // Add message listener
        chrome.runtime?.onMessage?.addListener(handleMessage);

        // Cleanup
        return () => {
            chrome.runtime?.onMessage?.removeListener(handleMessage);
        };
    }, []);

    useEffect(() => {
        if (emailData && action) {
            handleEmailAction();
        }
    }, [emailData, action]);

    const handleEmailAction = async () => {
        try {
            const endpoint = action === 'summarize' 
                ? 'http://localhost:8000/api/v1/summarize'
                : 'http://localhost:8000/api/v1/draft-reply';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    thread_content: emailData?.thread_content,
                    email_id: emailData?.email_id,
                    ...(action === 'draft' && { instruction: '' }) // Add instruction if needed
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data.content);
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    const showInstructionModal = () => {
        return new Promise<string | null>((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'gmail-copilot-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Draft Reply Instructions</h3>
                    <textarea placeholder="Type your instructions here..."></textarea>
                    <button id="submit-instruction">Submit</button>
                    <button id="cancel-instruction">Cancel</button>
                </div>
            `;
            document.body.appendChild(modal);

            const submitButton = document.getElementById('submit-instruction');
            const cancelButton = document.getElementById('cancel-instruction');

            if (submitButton) {
                submitButton.onclick = () => {
                    const instruction = modal.querySelector('textarea')?.value || '';
                    modal.remove();
                    resolve(instruction);
                };
            }

            if (cancelButton) {
                cancelButton.onclick = () => {
                    modal.remove();
                    resolve(null);
                };
            }
        });
    };

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <p>{error}</p>
            </div>
        );
    }

    if (!emailData) {
        return (
            <div className="p-4 text-center">
                <p>No email selected. Please open an email in Gmail to use Email Copilot.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">
                {action === 'summarize' ? 'Email Summary' : 'Draft Reply'}
            </h2>
            <div className="mb-4">
                <h3 className="font-semibold">Subject:</h3>
                <p>{emailData.subject}</p>
            </div>
            <div className="mb-4">
                <h3 className="font-semibold">From:</h3>
                <p>{emailData.sender}</p>
            </div>
            {result && (
                <div className="mt-4">
                    <h3 className="font-semibold">Result:</h3>
                    <p className="whitespace-pre-wrap">{result}</p>
                </div>
            )}
        </div>
    );
}