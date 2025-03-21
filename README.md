# Gmail Copilot Extension

A Chrome extension that provides AI-powered email thread summaries and automated reply drafting capabilities for Gmail.

## Prerequisites

- Python 3.8+
- MongoDB
- Chrome browser

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

## LLM Monitoring in Production with Kubernetes & CloudWatch Logs
This is a small write-up for a theorectical deployment of the Gmail Copilot Extension on a FastAPI server using Kubernetes and Docker running on an AWS EC2 instance. 

Here’s how the setup can be managed:

To effectively monitor LLMs in production, Kubernetes and AWS CloudWatch can be used together for real-time oversight. Kubernetes manages auto-scaling to handle sudden spikes in token usage or traffic, and its built-in health checks automatically restart pods when errors occur. Meanwhile, LLM-specific metrics such as tokens per request, API errors (e.g., rate limits), and response times are logged by the application and sent to CloudWatch. The CloudWatch Agent streamlines this process, while CloudWatch Metrics Filters parse logs to track trends like abnormal token consumption or repeated HTTP 429 errors. Additionally, custom alarms set in CloudWatch can notify the team immediately if defined thresholds are exceeded.