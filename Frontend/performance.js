let userData = {}; // Store performance data globally
let scoreChart, subjectChart;

// Fetch performance data from the server
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    const email = localStorage.getItem('email'); // Get email from localStorage

    if (!email) {
        console.error('No email found in localStorage');
        alert('No user is logged in. Redirecting to login page.');
        window.location.href = 'home.html';
        return;
    }

    fetch(`http://127.0.0.1:5000/api/performance/${email}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load performance data');
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Performance data loaded:', data);
            userData = data;
            loadUserData(); // Automatically load user data
        })
        .catch(error => {
            console.error('❌ Error loading performance data:', error);
        });
});

// Load user data to populate the UI
function loadUserData() {
    if (!userData || Object.keys(userData).length === 0) {
        console.warn('No user data found');
        return;
    }

    // Update UI with fetched data
    updateStats(userData.stats);
    updateScoreProgress(userData.score_progress);
    updateSubjectDistribution(userData.subject_distribution);
    updateRecentExams(userData.recent_exams);
}

// Update Stats Section
function updateStats(stats) {
    document.getElementById('avgScore').innerText = stats.average_score || '--';
    document.getElementById('examsCompleted').innerText = stats.exams_completed || '--';
    document.getElementById('studyTime').innerText = stats.total_study_time || '--';
}

// Update Score Progress Chart
function updateScoreProgress(progress) {
    if (!progress || progress.length === 0) {
        console.warn('No score progress data available');
        return;
    }

    const labels = progress.map(item => item.month);
    const scores = progress.map(item => item.score);

    if (scoreChart) {
        scoreChart.destroy(); // Destroy previous chart if exists
    }

    const ctx = document.getElementById('scoreChart').getContext('2d');
    scoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score Progression',
                data: scores,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Update Subject Distribution (Pie Chart)
function updateSubjectDistribution(subjects) {
    if (!subjects || subjects.length === 0) {
        console.warn('No subject distribution data available');
        return;
    }

    const labels = subjects.map(item => item.subject);
    const percentages = subjects.map(item => item.percentage);

    if (subjectChart) {
        subjectChart.destroy(); // Destroy previous chart if exists
    }

    const ctx = document.getElementById('subjectChart').getContext('2d');
    subjectChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Subject Distribution',
                data: percentages,
                backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Update Recent Exam Performance
function updateRecentExams(exams) {
    const examGrid = document.getElementById('examGrid');
    examGrid.innerHTML = ''; // Clear previous data

    if (!exams || exams.length === 0) {
        examGrid.innerHTML = '<div>No recent exams available.</div>';
        return;
    }

    exams.forEach(item => {
        const examCard = `
            <div class="exam-card">
                <div class="exam-name">${item.exam}</div>
                <div class="exam-detail">Date: ${item.date}</div>
                <div class="exam-detail">Questions: ${item.questions}</div>
                <div class="exam-detail">Time: ${item.time}</div>
                <div class="exam-detail">Score: <span class="score-badge">${item.score}</span></div>
            </div>
        `;
        examGrid.innerHTML += examCard;
    });
}

// Toggle Dropdown for Profile Button
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    dropdown.classList.toggle('active');
}

// Close Dropdown When Clicking Outside
window.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown');
    if (!event.target.closest('.profile-button')) {
        dropdown.classList.remove('active');
    }
});
