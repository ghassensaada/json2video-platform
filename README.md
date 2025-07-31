# JSON2Video Platform

A comprehensive video editing API platform similar to json2video, built with Node.js, Express, React, and SQLite.

## Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Template Management**: Create, edit, and manage video templates
- **Visual Editor**: Drag-and-drop interface for creating video templates
- **Render Logs**: Track video rendering jobs with real-time status updates
- **API Keys**: Generate and manage API keys for programmatic access
- **Real-time Preview**: Live preview of video templates with timeline
- **Multiple Output Formats**: JSON, PHP, and Node.js code generation

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

### Frontend
- **React** 18 with hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **React Hot Toast** for notifications

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd json2video
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Create necessary directories**
   ```bash
   mkdir -p data uploads uploads/videos
   ```

5. **Start the development servers**
   ```bash
   # Start both server and client
   npm run dev
   
   # Or start them separately:
   # Server: npm run server
   # Client: npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Login
- Email: `admin@json2video.com`
- Password: `admin123`

## Project Structure

```
json2video/
├── server/                 # Backend server
│   ├── database/          # Database setup and helpers
│   ├── middleware/        # Authentication middleware
│   ├── routes/           # API routes
│   └── index.js          # Main server file
├── client/               # React frontend
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── index.js      # React entry point
│   └── package.json      # Client dependencies
├── data/                 # SQLite database files
├── uploads/              # File uploads
└── package.json          # Server dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get single template
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/duplicate` - Duplicate template

### Renders
- `GET /api/renders` - Get all renders
- `GET /api/renders/:id` - Get single render
- `POST /api/renders` - Create new render job
- `DELETE /api/renders/:id` - Delete render
- `POST /api/renders/:id/retry` - Retry failed render
- `GET /api/renders/stats/summary` - Get render statistics

### API Keys
- `GET /api/apikeys` - Get all API keys
- `POST /api/apikeys` - Generate new API key
- `DELETE /api/apikeys/:id` - Delete API key
- `PUT /api/apikeys/:id/toggle` - Toggle API key status
- `POST /api/apikeys/:id/regenerate` - Regenerate API key

## Template Editor Features

### Visual Editor
- **Left Sidebar**: Project structure with variables, scenes, and elements
- **Center Panel**: Live preview with timeline and render controls
- **Right Sidebar**: Element properties and controls
- **Tabs**: Preview, Render, JSON, PHP, and Node.js code views

### Element Types
- **Text**: Customizable text with font, size, color, and positioning
- **Image**: Image elements with source URL and fit options
- **Shape**: Basic shapes (rectangle, circle) with colors
- **Audio**: Audio elements with volume control

### Element Properties
- **Position**: X, Y coordinates
- **Size**: Width and height
- **Timeline**: Duration, start time, fade in/out
- **Z-index**: Layer ordering
- **Rotation**: Element rotation

## Development

### Adding New Features

1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Add pages in `client/src/pages/`
3. **Database**: Update schema in `server/database/database.js`

### Code Style
- Use ES6+ features
- Follow React hooks patterns
- Use Tailwind CSS for styling
- Implement proper error handling

### Testing
```bash
# Run client tests
cd client
npm test

# Run server tests (when implemented)
npm test
```

## Deployment

### Production Build
```bash
# Build the React app
npm run build

# Start production server
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure proper `CORS_ORIGIN`
- Set up database backups

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## Roadmap

- [ ] Real video rendering engine
- [ ] Advanced timeline editor
- [ ] Template marketplace
- [ ] Team collaboration features
- [ ] Advanced animations
- [ ] Video effects and filters
- [ ] Cloud storage integration
- [ ] Analytics dashboard 