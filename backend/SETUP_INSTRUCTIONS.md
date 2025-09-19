# Backend Setup Instructions

## Prerequisites

You need to install these on your system:

### 1. Python 3.11+
Download from: https://www.python.org/downloads/

### 2. PostgreSQL with PostGIS Extension
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql postgis`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib postgis`

### 3. Redis (for background tasks)
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **macOS**: `brew install redis`
- **Linux**: `sudo apt-get install redis-server`

## Setup Steps

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup PostgreSQL Database
```bash
# Create database (run in terminal/command prompt)
createdb civic_platform

# Add PostGIS extension
psql civic_platform -c "CREATE EXTENSION postgis;"
```

### 4. Configure Environment Variables
```bash
# Copy the template file to .env
cp env_template.txt .env

# Edit .env file with your settings:
```

**Required Settings to Update in .env:**
- `DB_PASSWORD` - Your PostgreSQL password
- `EMAIL_HOST_USER` - Your email for sending notifications (optional)
- `EMAIL_HOST_PASSWORD` - Your email app password (optional)

### 5. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Admin Account)
```bash
python manage.py createsuperuser
```

### 7. Load Sample Data (Optional)
```bash
python manage.py load_sample_data
```

### 8. Start the Development Server
```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

## API Endpoints

- Admin Panel: `http://localhost:8000/admin`
- API Root: `http://localhost:8000/api/`
- Authentication: `http://localhost:8000/api/auth/`
- Issues: `http://localhost:8000/api/issues/`
- Forum: `http://localhost:8000/api/forum/`
- Events: `http://localhost:8000/api/events/`

## Frontend Integration

Update your frontend's API base URL to:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Check DB_PASSWORD in .env file
- Verify database exists: `psql -l`

### PostGIS Extension Error
```bash
# If PostGIS extension fails, try:
sudo apt-get install postgresql-15-postgis-3  # Linux
# or download PostGIS bundle for Windows
```

### Redis Connection Issues
- Make sure Redis is running: `redis-cli ping`
- Should return "PONG"

### Import Errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Optional: Background Tasks (Celery)

If you want to enable background tasks for notifications:

1. Start Redis:
```bash
redis-server
```

2. Start Celery Worker (in new terminal):
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
celery -A civic_platform worker -l info
```

3. Start Celery Beat (in another terminal):
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
celery -A civic_platform beat -l info
```

## Development Commands

```bash
# Create new migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic

# Start development server
python manage.py runserver

# Access Django shell
python manage.py shell
```
