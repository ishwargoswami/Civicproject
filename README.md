# Social Good & Civic Tech Platform

A comprehensive web application that connects citizens, government officials, and community leaders to create meaningful social impact through technology.

## Features

### 🏛️ Civic Engagement
- **Issue Reporting**: Citizens can report community problems with photos, location, and detailed descriptions
- **Issue Tracking**: Real-time status updates with timelines and progress tracking
- **Community Forum**: Discussions, polls, and petitions for community engagement
- **Interactive Maps**: Visualize reported issues and events with filtering capabilities

### 📅 Event Management
- **Event Calendar**: Discover community events and volunteer opportunities
- **RSVP System**: Easy event registration and attendance tracking
- **Volunteer Management**: Coordinate volunteers and track contributions

### 📊 Transparency Dashboard
- **Public Spending**: Track how public funds are allocated and spent
- **Project Progress**: Monitor government initiatives and infrastructure projects
- **Performance Metrics**: View key performance indicators and service quality
- **Public Records**: Access meeting minutes, reports, and official documents

### 🔔 Communication
- **Real-time Notifications**: Stay updated on issues, events, and community activities
- **Multi-channel Alerts**: In-app notifications with optional email/SMS
- **Customizable Preferences**: Control what notifications you receive

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Aceternity UI** components
- **Leaflet** for interactive maps
- **Recharts** for data visualization

### Backend (Planned)
- **Django** with Django Rest Framework
- **PostgreSQL** database
- **JWT** authentication
- **Celery** for background tasks
- **Redis** for caching and task queue
- **AI integration** for issue categorization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ishwargoswami/Civicproject.git
cd bolt-project-social
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication forms
│   ├── common/          # Shared components
│   ├── layout/          # Layout components
│   └── ui/              # Aceternity UI components
├── pages/               # Page components
├── router/              # Routing configuration
├── services/            # API services
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## User Roles

### Citizens
- Report issues in their community
- Participate in forums and discussions
- RSVP to events and volunteer
- View transparency data

### Government Officials
- Manage and respond to reported issues
- Update project status and timelines
- Create official announcements
- Access analytics and reports

### Administrators
- Manage users and permissions
- Moderate content and discussions
- Configure system settings
- Access comprehensive analytics

## Development Features

### Authentication System
- Role-based access control
- JWT token authentication
- Protected routes
- User profile management

### Issue Management
- Photo upload with preview
- Location services integration
- Category and priority assignment
- Status workflow management
- Voting and commenting system

### State Management
- Redux Toolkit for global state
- Async thunks for API calls
- Optimistic updates
- Error handling

### UI/UX
- Responsive design
- Dark theme
- Smooth animations
- Accessibility features
- Mobile-first approach

## API Integration

The frontend is designed to work with a Django REST API backend. Key endpoints include:

- `/auth/` - Authentication and user management
- `/issues/` - Issue reporting and tracking
- `/forum/` - Community discussions and polls
- `/events/` - Event management and RSVPs
- `/transparency/` - Public data and analytics
- `/notifications/` - User notifications
- `/maps/` - Geographic data and markers

## Future Enhancements

- [ ] Real-time chat and messaging
- [ ] Mobile app (React Native)
- [ ] AI-powered issue categorization
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Social media integration
- [ ] Document management system
- [ ] Workflow automation
- [ ] API rate limiting and caching

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@civicplatform.org or create an issue in the repository.

## Acknowledgments

- Built with modern web technologies
- Inspired by civic tech initiatives worldwide
- Designed for community impact and engagement
