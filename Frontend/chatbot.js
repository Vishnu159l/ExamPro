// Chatbot Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Ensure DOM is fully loaded before attaching events
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (userInput) {
        userInput.addEventListener('keypress', handleKeyPress);
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
});

// Toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotIcon = document.getElementById('chatbot-icon');
    
    chatbotContainer.classList.toggle('hidden');
    
    // Optional: You could change icon state or add animations here
}

// Send message to backend
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    // Validate message
    if (!message) return;

    // Add user message to chat window
    addMessage('User', message);

    // Clear input
    userInput.value = '';

    try {
        // Send message to backend
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        // Check if response is okay
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Add bot response to chat window
        if (data.response) {
            addMessage('Bot', data.response);
        } else {
            addMessage('Bot', 'Sorry, I could not process your request.');
        }

    } catch (error) {
        console.error('Error:', error);
        addMessage('Bot', 'Sorry, there was an error connecting to the chatbot.');
    }
}

// Add message to chat window
function addMessage(sender, text) {
    const chatWindow = document.getElementById('chat-window');
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender.toLowerCase()}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    
    // Append message
    chatWindow.appendChild(messageDiv);
    
    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Initialization log
console.log('Chatbot script loaded successfully!');