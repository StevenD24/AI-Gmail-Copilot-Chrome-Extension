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

## LLM Monitoring in Production
This is a small write-up for a theoretical deployment of the Gmail Copilot Extension on a FastAPI server using Kubernetes and Docker running on an AWS EC2 instance. 

Here's how LLM monitoring can be implemented:

### Metrics-based Monitoring with Prometheus and Grafana
Prometheus and Grafana provide a comprehensive monitoring solution for LLMs in production. The FastAPI application can expose custom metrics endpoints that Prometheus scrapes at regular intervals, capturing essential LLM performance data:

- **API Usage Metrics**: Track total requests, tokens consumed per request, and cost accumulation.
- **Rate Limiting**: Monitor API rate limit consumption and remaining quota to prevent service disruptions.
- **Latency Metrics**: Measure response times including time-to-first-token and total generation time.
- **Error Rates**: Track different types of errors (authentication, context length, content filtering).

Grafana dashboards can visualize these metrics with alerts for abnormal patterns, such as sudden spikes in token usage or approaching rate limits.

### Response Quality Monitoring with AI Evaluation
For evaluating response quality, a custom monitoring pipeline can be implemented:

1. **Automated Evaluation**: Use a separate "judge" LLM to evaluate responses against criteria like relevance, accuracy, and helpfulness.
2. **Feedback Collection**: Store user feedback and correlate it with model responses.
3. **Custom Metrics Export**: Export these quality metrics to Prometheus via a custom exporter.

This approach allows for:
- Detecting drift in model output quality
- Identifying specific types of request patterns that lead to poor responses
- Creating quality score dashboards in Grafana alongside performance metrics

The combined system provides both quantitative performance monitoring and qualitative response evaluation, creating a complete picture of LLM service health in production.