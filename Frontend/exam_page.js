// Example exam data (Hardcoded for simplicity)
const questions = [
    {
        "text": "Write a class to implement a basic Stack in C++.",
        "input": "Push 5, Push 10, Pop, Print",
        "output": "5"
    },
    {
        "text": "Implement a class to find the GCD of two numbers.",
        "input": "12, 18",
        "output": "6"
    },
    {
        "text": "Write a C++ program to reverse a string.",
        "input": "hello",
        "output": "olleh"
    },
    {
        "text": "Write a C++ class to implement a Queue.",
        "input": "Enqueue 5, Enqueue 10, Dequeue, Print",
        "output": "5"
    },
    {
        "text": "Create a C++ program to check if a number is prime.",
        "input": "7",
        "output": "Prime"
    }
];

let currentQuestionIndex = 0;
const totalQuestions = questions.length;

// Track bookmarked, completed, and attempted questions
let bookmarkedQuestions = [];
let completedQuestions = [];
let attemptedQuestions = [];

// Load the first question when the page loads
function loadQuestions() {
    loadQuestion(currentQuestionIndex);
    loadQuestionPanel();
    updateProgressBar();
}

// Load a specific question
function loadQuestion(index) {
    const question = questions[index];
    document.querySelector('#questionContent').innerHTML = `
        <h2>Question ${index + 1} of ${totalQuestions}</h2>
        <p>${question.text}</p>
        <p><strong>Input:</strong> ${question.input}</p>
        <p><strong>Expected Output:</strong> ${question.output}</p>
    `;
    document.querySelector('#codeEditor').value = `// Write your code here...\n`;

    highlightCurrentQuestion(index);
}

// Save and load the next question
function saveAndNext() {
    const code = document.querySelector('#codeEditor').value.trim();

    // Mark the current question as attempted
    if (code.length > 0) {
        if (!attemptedQuestions.includes(currentQuestionIndex)) {
            attemptedQuestions.push(currentQuestionIndex);
        }
    }

    // Mark the current question as completed if not already done
    if (!completedQuestions.includes(currentQuestionIndex)) {
        completedQuestions.push(currentQuestionIndex);
    }

    // Move to the next question or submit
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
        updateProgressBar();
    } else {
        alert('All questions completed! Submitting your answers...');
        window.location.href = 'Results_page.html'; // Redirect to results
    }

    updateQuestionPanel(); // Update colors after moving to next
}

// Run code (for demo, actual execution requires backend)
function runCode() {
    alert('Code executed! (Demo only)');
}

// Bookmark the current question
function bookmarkQuestion() {
    const questionId = currentQuestionIndex;

    if (bookmarkedQuestions.includes(questionId)) {
        // Remove bookmark if already bookmarked
        bookmarkedQuestions = bookmarkedQuestions.filter(id => id !== questionId);
    } else {
        // Add to bookmarks
        bookmarkedQuestions.push(questionId);
    }

    updateQuestionPanel(); // Update colors after bookmarking
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.querySelector('#progress');
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Load and display question panel
function loadQuestionPanel() {
    const numberBoxContainer = document.querySelector('#numberBoxContainer');
    numberBoxContainer.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
        numberBoxContainer.innerHTML += `
            <div class="number-box" id="q${i}" onclick="jumpToQuestion(${i})">${i + 1}</div>
        `;
    }
    updateQuestionPanel();
}

// Jump to a specific question
function jumpToQuestion(index) {
    currentQuestionIndex = index;
    loadQuestion(index);
    updateProgressBar();
    updateQuestionPanel();
}

// Update colors in the question panel
function updateQuestionPanel() {
    document.querySelectorAll('.number-box').forEach((box, i) => {
        box.classList.remove('bookmarked', 'completed', 'unattempted', 'active');

        if (bookmarkedQuestions.includes(i)) {
            box.classList.add('bookmarked'); // Purple if bookmarked
        } else if (completedQuestions.includes(i)) {
            box.classList.add('completed'); // Green if completed
        } else if (!attemptedQuestions.includes(i)) {
            box.classList.add('unattempted'); // Red if not attempted
        }

        if (i === currentQuestionIndex) {
            box.classList.add('active'); // Blue if active
        }
    });
}

// Highlight the current question in the side panel
function highlightCurrentQuestion(index) {
    updateQuestionPanel(); // Update panel after switching questions
}


// Load user name from localStorage
function loadUserName() {
    const firstName = localStorage.getItem('firstName') || 'Guest';
    const lastName = localStorage.getItem('lastName') || '';
    document.querySelector('#userName').innerText = `Welcome, ${firstName} ${lastName}!`;
}
// Load user name and questions when the page loads
window.onload = function () {
    loadUserName();
    loadQuestions();
    audio.play().then(() => {
        audio.pause(); // Pause after preloading
        audio.currentTime = 0; // Reset to the start
    }).catch((error) => {
        console.warn("Audio preload failed:", error);
    });
};

let tabSwitchCount = 0; // Counter for tab switches

// Event listener to detect when the user switches away from the current tab
document.addEventListener("visibilitychange", async () => {
    if (document.hidden) {
        tabSwitchCount++;
        alert(`You switched tab. Please focus on the test.`);
        playTabSwitchSound();
        // Send tab switch event to the backend
        sendTabSwitchEvent(tabSwitchCount);

        // If tab switch count exceeds 3, auto-submit the exam
        if (tabSwitchCount >= 3) {
            alert("You have switched tabs too many times. Your exam is being submitted...");
            submitExam(); // Auto-submit exam
        }
    }
});

// Function to send tab switch data to the server
async function sendTabSwitchEvent(count) {
    const userEmail = localStorage.getItem('email') || 'guest@example.com'; // Get email if available

    const data = {
        email: userEmail,
        tabSwitchCount: count,
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/tab-switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error('Error sending tab switch data to server.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to auto-submit the exam and redirect to results page
function submitExam() {
    // Optionally, save the answers or perform additional actions here
    window.location.href = 'Results_page.html'; // Redirect to results
}


function playTabSwitchSound() {
    const audio = document.querySelector("#tabSwitchSound");
    audio.play().catch((error) => {
        console.error("Error playing sound:", error);
    })
}