from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

app = Flask(__name__)
CORS(app)

# File paths
USER_FILE = os.path.join(os.path.dirname(__file__), 'user.json')
STUDENT_FILE = os.path.join(os.path.dirname(__file__), 'student.json')
PERFORMANCE_FILE = os.path.join(os.path.dirname(__file__), 'performance.json')
TAB_SWITCH_LOG = os.path.join(os.path.dirname(__file__), 'tab_switch_log.json')


SENDER_EMAIL = "akshayofficialnew@gmail.com"
APP_PASSWORD = "yzdk uwwb ttvv jmnr"  # App-specific password
FACULTY_EMAIL = "dhasaraju@gmail.com"  # Faculty email to receive alerts


# --- Utility Functions ---
def load_users():
    if os.path.exists(USER_FILE):
        with open(USER_FILE, 'r') as file:
            return json.load(file)
    return []


def save_users(users):
    with open(USER_FILE, 'w') as file:
        json.dump(users, file, indent=4)


def load_student_data():
    if os.path.exists(STUDENT_FILE):
        with open(STUDENT_FILE, 'r') as file:
            return json.load(file)
    return []


def save_student_data(students):
    with open(STUDENT_FILE, 'w') as file:
        json.dump(students, file, indent=4)


def load_performance_data():
    if os.path.exists(PERFORMANCE_FILE):
        with open(PERFORMANCE_FILE, 'r') as file:
            return json.load(file)
    return {"users": []}


def save_tab_switch_log(data):
    if os.path.exists(TAB_SWITCH_LOG):
        with open(TAB_SWITCH_LOG, 'r') as file:
            existing_data = json.load(file)
    else:
        existing_data = []

    existing_data.append(data)

    with open(TAB_SWITCH_LOG, 'w') as file:
        json.dump(existing_data, file, indent=4)


# --- Email Alert ---
def send_email_alert(to_email, subject, message_body):
    try:
        # Create the email content
        message = MIMEMultipart()
        message["From"] = SENDER_EMAIL
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(message_body, "plain"))

        # Connect to the SMTP server
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure the connection
            server.login(SENDER_EMAIL, APP_PASSWORD)  # Login to the email account
            server.sendmail(SENDER_EMAIL, to_email, message.as_string())  # Send the email

        print(f"Alert email sent to {to_email} successfully.")
    except Exception as e:
        print(f"Error sending email: {e}")


# --- Authentication Routes ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    signup_type = data.get('signupType')

    users = load_users()
    students = load_student_data()

    # Check if email already exists
    for user in users:
        if user['email'] == email:
            return jsonify({'error': 'Email already exists'}), 400

    # Create new user and student record
    new_user = {
        'firstName': first_name,
        'lastName': last_name,
        'email': email,
        'password': password,
        'signupType': signup_type,
    }
    users.append(new_user)
    save_users(users)

    new_student = {
        'email': email,
        'coursesEnrolled': 0,
        'overallCompletion': 0,
        'completed': 0,
        'expired': 0,
        'courses': []
    }
    students.append(new_student)
    save_student_data(students)

    print(f"New user added: {new_user}")
    print(f"New student record created: {new_student}")

    return jsonify({'message': 'User created successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    users = load_users()

    # Validate user credentials
    for user in users:
        if user['email'] == email and user['password'] == password:
            print(f"User found: {user}")
            return jsonify({
                'message': 'Login successful',
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'email': user['email']
            }), 200

    print("Invalid credentials")
    return jsonify({'error': 'Invalid credentials'}), 401


# --- Student & Performance Data Routes ---
@app.route('/get-student-data', methods=['POST'])
def get_student_data():
    data = request.json
    email = data.get('email')

    students = load_student_data()

    # Find student data by email
    student = next((s for s in students if s['email'] == email), None)

    if not student:
        return jsonify({'error': 'Student data not found'}), 404

    print(f"Student data found: {student}")
    return jsonify(student)


@app.route('/performance', methods=['GET'])
def get_all_performance():
    performance_data = load_performance_data()
    return jsonify(performance_data), 200


@app.route('/api/performance/<email>', methods=['GET'])
def get_performance_by_email(email):
    performance_data = load_performance_data()
    for user in performance_data["users"]:
        if user["email"] == email:
            return jsonify(user), 200
    return jsonify({"error": "User performance data not found"}), 404


# --- Tab Switch Tracking ---
@app.route('/tab-switch', methods=['POST'])
def tab_switch_event():
    data = request.json
    email = data.get('email')
    tab_switch_count = data.get('tabSwitchCount')
    timestamp = data.get('timestamp')

    # Prepare data to log
    log_data = {
        "email": email,
        "tabSwitchCount": tab_switch_count,
        "timestamp": timestamp,
        "action": "Exam auto-submitted" if tab_switch_count >= 3 else "Tab switch detected"
    }

    # Save tab switch event to log file
    save_tab_switch_log(log_data)

    # Send email alert to faculty
    subject = "Malpractice Alert: Tab Switch Detected"
    message_body = (
        f"Alert: A student has switched tabs during the exam.\n\n"
        f"Student Email: {email}\n"
        f"Tab Switch Count: {tab_switch_count}\n"
        f"Timestamp: {timestamp}\n"
    )
    send_email_alert(FACULTY_EMAIL, subject, message_body)

    print(f"Tab switch detected for {email}. Count: {tab_switch_count}, Time: {timestamp}")

    # Auto-submit exam after 3 switches
    if tab_switch_count >= 3:
        message_body += "\nAction: Exam auto-submitted due to excessive tab switches."
        send_email_alert(FACULTY_EMAIL, "Exam Auto-Submitted Alert", message_body)
        return jsonify({"message": "Tab switch limit exceeded. Exam auto-submitted."}), 200

    return jsonify({"message": "Tab switch recorded and email alert sent."}), 200


# --- Run Flask Application ---
if __name__ == '__main__':
    app.run(debug=True)
