# ConnectSphere

A modern social media platform built with Next.js 14, Node.js, and MongoDB.

## Features

- Authentication with JWT and OAuth2.0
- Real-time messaging and notifications using Socket.io
- Rich user profiles
- Post creation and sharing
- Friend connections
- Real-time notifications
- Advanced search functionality
- Responsive design with dark/light mode

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Zustand
- React Query
- React Hook Form
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT
- Cloudinary

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/connectsphere.git
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Backend (.env)
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Run the development servers
```bash
# Run frontend
cd frontend
npm run dev

# Run backend
cd ../backend
npm run dev
```

## Project Structure

### Frontend
```
frontend/
├── components/     # Reusable UI components
├── pages/         # Next.js pages
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── styles/        # Global styles and Tailwind config
├── contexts/      # React contexts
├── types/         # TypeScript types/interfaces
└── services/      # API service functions
```

### Backend
```
backend/
├── controllers/   # Route controllers
├── models/        # MongoDB models
├── routes/        # API routes
├── middleware/    # Custom middleware
├── utils/         # Utility functions
├── config/        # Configuration files
└── services/      # Business logic services
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
