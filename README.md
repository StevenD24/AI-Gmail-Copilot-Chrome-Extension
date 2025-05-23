# Gmail Copilot Chrome Extension

This project enhances Gmail with AI-powered email thread summaries and automated reply drafting. It uses advanced language models to help you manage your inbox efficiently and communicate effectively.

Key Features:
- **AI Summaries:** Quickly generate concise summaries of long email threads.
- **Automated Replies:** Draft context-aware email responses with AI.
- **Seamless Gmail Integration:** Use directly within the Gmail interface.
- **Customizable Backend:** Powered by Python FastAPI and MongoDB for flexibility.

## Prerequisites

- Python 3.8+
- FastAPI
- MongoDB
- Chrome browser
- OpenAI API (Any LLM works)

## Installation Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install the required dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the `backend` directory with the following contents:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=gmail_copilot
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-3.5-turbo
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload
```

The backend will start on http://localhost:8000

### 2. Chrome Extension Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by clicking the toggle switch in the top right corner
3. Click "Load unpacked" button in the top left
4. Navigate to and select the `extension/dist` directory from this project
5. The Gmail Copilot extension icon should now appear in your Chrome toolbar

## Development

- Backend API code is in the `backend/app` directory
- Chrome extension source code is in the `extension` directory

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
