# Civic Platform Backend

A comprehensive Django REST API backend for the Social Good & Civic Tech Platform, providing robust functionality for community engagement, issue reporting, event management, and government transparency.

## Features

### 🔐 Authentication & User Management
- JWT-based authentication with refresh tokens
- Role-based access control (Citizens, Officials, Administrators)
- User profiles with verification system
- Activity tracking and audit logs
- Social authentication support

### 🏛️ Core Modules

#### Issues Management
- Community issue reporting with geolocation
- Photo uploads and attachments
- Categorization and priority levels
- Status tracking and timeline
- Voting and commenting system
- Assignment to government officials

#### Community Forum
- Discussion posts with rich content
- Polls with multiple choice options
- Petitions with signature tracking
- Voting system (upvotes/downvotes)
- Threaded comments and replies
- Content moderation tools

#### Events & Volunteering
- Event creation and management
- RSVP system with capacity limits
- Volunteer coordination and check-in
- Event feedback and ratings
- Calendar integration
- Location-based discovery

#### Transparency Dashboard
- Public spending tracking
- Project progress monitoring
- Budget allocation reports
- Performance metrics
- Document management
- Department information

#### Interactive Maps
- Geographic data visualization
- Issue and event mapping
- Public facility locations
- District boundaries
- Layer-based filtering
- Spatial queries

#### Notifications
- Real-time notification system
- Email and SMS integration
- Customizable preferences
- Event-driven triggers
- Batch processing with Celery

## Technology Stack

- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: JWT (Simple JWT)
- **Task Queue**: Celery + Redis
- **File Storage**: Local/AWS S3 support
- **API Documentation**: Auto-generated with DRF
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15+ with PostGIS
- Redis (for Celery)
- Git

### Installation

1. **Clone and setup**:
```bash
git clone <repository-url>
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Database setup**:
```bash
# Install PostgreSQL and PostGIS
# Create database
createdb civic_platform
psql civic_platform -c "CREATE EXTENSION postgis;"
```

3. **Environment configuration**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run setup script**:
```bash
python setup.py
```

5. **Start development server**:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Docker Setup (Recommended)

1. **Start all services**:
```bash
docker-compose up -d
```

2. **Run migrations**:
```bash
docker-compose exec web python manage.py migrate
```

3. **Create superuser**:
```bash
docker-compose exec web python manage.py createsuperuser
```

4. **Load sample data**:
```bash
docker-compose exec web python manage.py load_sample_data
```

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register/     - User registration
POST /api/auth/login/        - User login
POST /api/auth/logout/       - User logout
GET  /api/auth/me/           - Current user profile
PUT  /api/auth/profile/      - Update profile
```

### Issues Endpoints
```
GET    /api/issues/          - List issues
POST   /api/issues/          - Create issue
GET    /api/issues/{id}/     - Get issue details
PUT    /api/issues/{id}/     - Update issue
DELETE /api/issues/{id}/     - Delete issue
POST   /api/issues/{id}/vote/ - Vote on issue
```

### Forum Endpoints
```
GET    /api/forum/posts/     - List forum posts
POST   /api/forum/posts/     - Create post
GET    /api/forum/posts/{id}/ - Get post details
POST   /api/forum/posts/{id}/vote/ - Vote on post
POST   /api/forum/posts/{id}/poll/vote/ - Vote on poll
```

### Events Endpoints
```
GET    /api/events/         - List events
POST   /api/events/         - Create event
GET    /api/events/{id}/    - Get event details
POST   /api/events/{id}/rsvp/ - RSVP to event
POST   /api/events/{id}/volunteer/ - Volunteer for event
```

### Maps Endpoints
```
GET    /api/maps/issues/    - Get issue markers
GET    /api/maps/events/    - Get event markers
GET    /api/maps/facilities/ - Get public facilities
```

## Database Schema

### Core Models

#### User Model
- Extended Django user with civic-specific fields
- Role-based permissions (citizen, official, admin)
- Profile information and verification status
- Activity tracking and engagement metrics

#### Issue Model
- Geographic location with PostGIS Point field
- Category, priority, and status tracking
- Timeline of events and status changes
- Voting and subscription system

#### Forum Models
- Posts with different types (discussion, poll, petition)
- Voting system with upvotes/downvotes
- Poll options and voting tracking
- Petition signatures and goals

#### Event Models
- Location-based events with capacity limits
- RSVP system with guest tracking
- Volunteer management and check-in
- Feedback and rating system

## Development

### Project Structure
```
backend/
├── civic_platform/         # Django project settings
├── accounts/               # User management
├── issues/                 # Issue tracking
├── forum/                  # Community forum
├── events/                 # Event management
├── notifications/          # Notification system
├── transparency/           # Government transparency
├── maps/                   # Geographic features
├── media/                  # Uploaded files
├── static/                 # Static files
└── templates/              # Email templates
```

### Key Features

#### Geographic Features
- PostGIS integration for spatial data
- Location-based queries and filtering
- Distance calculations and proximity search
- Map layer management

#### File Handling
- Image upload and processing
- Document management
- AWS S3 integration for production
- File type validation and security

#### Background Tasks
- Celery integration for async processing
- Email sending and notifications
- Data processing and analytics
- Scheduled tasks with Celery Beat

#### Security
- JWT authentication with refresh tokens
- Role-based permissions
- Input validation and sanitization
- CORS configuration for frontend
- Rate limiting and throttling

### Testing

Run tests with:
```bash
python manage.py test
```

### Code Quality

Format code with:
```bash
black .
isort .
flake8
```

## Deployment

### Production Setup

1. **Environment Variables**:
```bash
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgres://user:pass@host:port/dbname
REDIS_URL=redis://host:port/0
```

2. **Database**:
- Use managed PostgreSQL with PostGIS
- Set up read replicas for scaling
- Configure connection pooling

3. **File Storage**:
- Configure AWS S3 for media files
- Set up CDN for static files
- Enable file compression

4. **Email**:
- Configure SMTP settings
- Set up email templates
- Enable email notifications

5. **Monitoring**:
- Set up logging and monitoring
- Configure error tracking
- Monitor performance metrics

### Docker Production

Use the provided `docker-compose.yml` with production overrides:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## API Examples

### Create an Issue
```python
import requests

data = {
    "title": "Broken streetlight on Main St",
    "description": "The streetlight has been out for 3 days",
    "category": "infrastructure",
    "priority": "medium",
    "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "Main St & 1st Ave"
    }
}

response = requests.post(
    'http://localhost:8000/api/issues/',
    json=data,
    headers={'Authorization': 'Bearer your-jwt-token'}
)
```

### Vote on Forum Post
```python
response = requests.post(
    'http://localhost:8000/api/forum/posts/123/vote/',
    json={"vote_type": "up"},
    headers={'Authorization': 'Bearer your-jwt-token'}
)
```

### RSVP to Event
```python
response = requests.post(
    'http://localhost:8000/api/events/456/rsvp/',
    json={"status": "attending", "guests": 1},
    headers={'Authorization': 'Bearer your-jwt-token'}
)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

Built with ❤️ for civic engagement and community empowerment.
