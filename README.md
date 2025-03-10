# SturgTrader

SturgTrader is a next-generation trading platform with a sleek glassmorphic UI, offering powerful trading tools and potential integration with Freqtrade trading strategies.

## Project Structure

The project is divided into two main parts:

- **Frontend**: A Next.js application with a modern glassmorphic UI
- **Backend**: An API server (to be expanded based on trading strategy requirements)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Docker (for running Freqtrade strategies)

### Installation

1. Clone this repository
2. Install frontend dependencies:

```bash
cd frontend
npm install
# or 
yarn install
```

3. Install backend dependencies:

```bash
cd backend
npm install
# or
yarn install
```

### Running the Development Server

#### Frontend

```bash
cd frontend
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

#### Backend

```bash
cd backend
npm run dev
# or
yarn dev
```

The API server will be available at http://localhost:4000

## Features

- **Video Intro**: Engaging intro video that plays before showing the login/registration
- **Glassmorphic UI**: Modern UI with glass-like transparency effects
- **Trading Dashboard**: Comprehensive trading interface with real-time data
- **Authentication**: Secure user authentication system
- **Freqtrade Integration**: Potential for integration with Freqtrade trading strategies

## Deployment to Vercel

### Frontend Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to the frontend folder:
```bash
cd frontend
```

3. Deploy to Vercel:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Environment Variables

For production, you'll need to set up the following environment variables in Vercel:

- `NEXT_PUBLIC_API_URL`: URL of your backend API

## Freqtrade Integration

SturgTrader can be integrated with your existing Freqtrade trading strategies. Here's how:

1. Ensure your Freqtrade instances are properly configured with entry_pricing and exit_pricing parameters.
2. Use Docker to manage your Freqtrade instances.
3. Connect the SturgTrader backend to your Docker-based Freqtrade instances.

## Troubleshooting

If you encounter issues with Docker storage space, clean up unused Docker resources:

```bash
docker system prune -a
```

This will help reclaim disk space from unused Docker images, containers, and volumes.

## License

[MIT](LICENSE)
