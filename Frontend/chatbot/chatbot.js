// Toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById("chatbot-container");
    chatbotContainer.classList.toggle("hidden");
  }
  
  // Send message to Flask backend
  async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (!message) return;
  
    addMessage("User", message);
    userInput.value = "";
  
    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
  
      const data = await response.json();
      if (data.response) {
        addMessage("Bot", data.response);
      } else {
        addMessage("Bot", "Error: No response received.");
      }
    } catch (error) {
      addMessage("Bot", "Error: Unable to connect to chatbot.");
    }
  }
  
  // Add message to chat window
  function addMessage(sender, text) {
    const chatWindow = document.getElementById("chat-window");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender.toLowerCase()}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  
  // Handle 'Enter' key press
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }
  