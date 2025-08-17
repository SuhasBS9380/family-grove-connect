# Family Grove Connect

A comprehensive family connection platform built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

🏠 **Family Management**
- Create or join families with unique family codes
- Admin and member roles
- Family member management

📱 **Communication**
- Real-time family chat
- Posts and social feed
- Comments and likes system

📅 **Events & Memories**
- Create and manage family events
- RSVP functionality
- Memories with photos and videos
- Family tree (coming soon)

🔐 **Authentication & Security**
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and middleware

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Router** for navigation
- **React Query** for state management
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **CORS** for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (already configured)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd family-grove-connect
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm start
   ```
   This will start both the backend server (port 5000) and frontend development server (port 5173).

### Alternative: Start servers separately

**Backend only:**
```bash
npm run server:dev
```

**Frontend only:**
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Family Management
- `GET /api/family` - Get family details
- `PUT /api/family` - Update family (admin only)
- `POST /api/family/join` - Join family with code
- `DELETE /api/family/member/:userId` - Remove member (admin only)
- `POST /api/family/leave` - Leave family

### Posts & Social Feed
- `GET /api/posts` - Get family posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/comment` - Add comment
- `DELETE /api/posts/:postId` - Delete post

### Messages & Chat
- `GET /api/messages` - Get family messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:messageId` - Delete message
- `GET /api/messages/unread-count` - Get unread count

### Events
- `GET /api/events` - Get family events
- `POST /api/events` - Create new event
- `POST /api/events/:eventId/rsvp` - RSVP to event
- `GET /api/events/:eventId` - Get event details
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event

### Memories
- `GET /api/memories` - Get family memories
- `POST /api/memories` - Create new memory
- `POST /api/memories/:memoryId/like` - Like/unlike memory
- `POST /api/memories/:memoryId/comment` - Add comment
- `DELETE /api/memories/:memoryId` - Delete memory

## Usage

### Registration & Login
1. **New User**: Click "Register here" from login page
2. **Choose**: Create new family OR join existing family with code
3. **Complete**: Fill in personal details and create account

### Family Features
- **Admin**: Can manage family settings and remove members
- **Members**: Can participate in all family activities
- **Family Code**: Share with relatives to invite them

### Creating Content
- **Posts**: Share text, photos, videos with family
- **Messages**: Real-time chat with all family members
- **Events**: Create events with RSVP tracking
- **Memories**: Preserve special moments with media

## Development

### Available Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run server` - Start backend production server
- `npm run server:dev` - Start backend development server
- `npm start` - Start both frontend and backend concurrently
- `npm run install:all` - Install dependencies for both frontend and backend

---

**Happy Family Connecting! 👨‍👩‍👧‍👦**

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c3546027-9df3-45d0-aa24-e92ee5bfc381) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
