# Jarvis AI - Web Voice Assistant

A web-based voice assistant powered by React and FastAPI. This project provides a beautiful and intuitive interface to interact with an AI assistant, featuring secure authentication and a responsive, modern UI with a dark mode.

## Features

- **🎙️ Voice-Enabled Conversations**: Speak directly to Jarvis and get instant voice responses.
- **🧠 Smart & Fast**: Get quick and intelligent answers to your questions.
- **🔐 Secure Authentication**: User accounts are protected with JWT-based authentication.
- **📱 Responsive UI**: A clean and modern interface that works on all devices.
- **🌙 Dark Mode**: Switch between light and dark themes for your comfort.
- **▶️ Real-time & Interactive**: See your conversation history and get real-time feedback.

## Project Structure

```
Jarvis-clean/
│
├── backend/
│   ├── main.py            # FastAPI main application
│   ├── auth.py            # Authentication logic
│   ├── database.py        # Database setup
│   ├── models.py          # SQLAlchemy models
│   ├── requirement.txt    # Backend dependencies
│   └── jarvis.db          # SQLite database
│
├── jarvis-frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── Jarvis.jsx     # Chat interface
│   │   ├── Login.jsx      # Login page
│   │   └── Signup.jsx     # Signup page
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
└── README.md              # Project documentation
```

## Installation

### Backend (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    venv\Scripts\activate  # On Windows
    source venv/bin/activate # On Linux/Mac
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirement.txt
    ```

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd jarvis-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

1.  **Run the backend server:**
    -   Make sure you are in the `backend` directory.
    -   Run the following command:
        ```bash
        uvicorn main:app --reload
        ```
    -   The backend will be running at `http://127.0.0.1:8000`.

2.  **Run the frontend development server:**
    -   Make sure you are in the `jarvis-frontend` directory.
    -   Run the following command:
        ```bash
        npm run dev
        ```
    -   Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

3.  **Create an account and log in.**

4.  **Start talking to Jarvis!**
