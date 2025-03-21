This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Gmail Copilot Extension

A Chrome extension that provides email thread summaries and automated reply drafting using AI, built with Next.js, Python FastAPI, and MongoDB.

## Project Structure

```
.
├── extension/          # Chrome extension files
├── frontend/          # Next.js frontend
├── backend/           # Python FastAPI backend
└── docs/             # Documentation
```

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- MongoDB
- Chrome browser

## Installation Instructions

### 1. Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `extension` directory from this project
5. The extension should now appear in your Chrome toolbar

### 2. Backend Setup (Python FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
```

The backend will start on http://localhost:8000

### 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run build
npm run dev
```

The development server will start on http://localhost:3000

## Development

- Frontend code is in the `frontend` directory
- Backend API is in the `backend` directory
- Chrome extension manifest and specific files are in the `extension` directory

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Environment Variables

Create `.env` files in both frontend and backend directories:

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=gmail_copilot
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-3.5-turbo
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Monitoring and Production Considerations

See [docs/monitoring.md](docs/monitoring.md) for details on:
- LLM monitoring approach
- Token usage tracking
- Rate limiting
- Error handling
- Production deployment considerations
