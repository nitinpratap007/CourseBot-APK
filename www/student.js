document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    // Simulate a unique student for this session
    const studentId = 'Student_' + Math.floor(Math.random() * 10000);

    function addMessage(text, sender, isMarkdown = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        if (isMarkdown && typeof marked !== 'undefined') {
            messageDiv.innerHTML = marked.parse(text);
        } else {
            messageDiv.textContent = text;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // Typing effect function
    async function typeMessage(messageDiv, fullText) {
        let currentText = '';
        messageDiv.innerHTML = '';
        
        // Simple fast typing effect
        for (let i = 0; i < fullText.length; i++) {
            currentText += fullText.charAt(i);
            
            // If it's a space or we reach the end, update HTML
            if (fullText.charAt(i) === ' ' || i === fullText.length - 1) {
                messageDiv.innerHTML = marked.parse(currentText);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                // Wait a tiny bit to simulate typing speed
                await new Promise(r => setTimeout(r, 10));
            }
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const question = userInput.value.trim();
        if (!question) return;

        // Display user message
        addMessage(question, 'user');
        userInput.value = '';
        
        // Add empty bot message container for typing effect
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot', 'typing-indicator');
        botMessageDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        chatMessages.appendChild(botMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Send query to API
            const response = await apiPost('/query', {
                student: studentId,
                question: question
            });
            
            // Remove typing indicator styling
            botMessageDiv.classList.remove('typing-indicator');
            
            // Stream the actual response
            await typeMessage(botMessageDiv, response.answer);
            
        } catch (error) {
            botMessageDiv.classList.remove('typing-indicator');
            botMessageDiv.textContent = 'Sorry, I encountered an error connecting to the server. Please try again later.';
        }
    });
});
