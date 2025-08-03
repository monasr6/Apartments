# 🏠 Apartments Listing Application

A full-stack web application for managing apartment listings, built with modern technologies and containerized with Docker.

## 🚀 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **Container**: Docker

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Container**: Docker

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MySQL with persistent volumes
- **Networking**: Custom Docker network

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- [Make](https://www.gnu.org/software/make/) (optional, for using Makefile commands)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd apartments
```

### 2. Environment Configuration
The application uses environment variables defined in the `docker-compose.yml` file. Default values are:

- **Database**: `apartments_db`
- **Database User**: `apartments_user`
- **Database Password**: `apartments_password`
- **Backend Port**: `3001`
- **Frontend Port**: `3000`

## 🚀 Running the Application

### Quick Start (Recommended)
```bash
# Build and start all services
make up

# Or without Make
docker-compose up -d --build
```

### Manual Docker Compose Commands
```bash
# Build and start all services in detached mode
docker-compose up -d --build

# View logs from all services
docker-compose logs -f

# Stop all services
docker-compose down

# Restart all services
docker-compose down && docker-compose up -d --build
```

### 🌐 Access the Application

Once the containers are running:

- **Frontend**: http://localhost:3000
- **Default Route**: http://localhost:3000/apartments (Apartments Listing Page)
- **Add Apartment**: http://localhost:3000/add-apartment
- **Backend API**: http://localhost:3001
- **Database**: localhost:3306 (for external connections)

> **Note**: The default landing page redirects to the apartments listing page for better user experience.

## 📸 Application Screenshots

### Apartments Listing Page
<img width="1460" height="968" alt="image" src="https://github.com/user-attachments/assets/192f783e-9852-426c-b943-a556da1a53f5" />

*Browse and filter apartment listings with advanced search options*

### Add Apartment Page
<img width="1460" height="968" alt="image" src="https://github.com/user-attachments/assets/a1300874-1bb1-4109-8714-0657e2ec0999" />

*Create new apartment listings with comprehensive details*

### Apartment Filters
<img width="1460" height="968" alt="image" src="https://github.com/user-attachments/assets/1c86d38b-5bc3-4c35-a294-8cb34eee171e" />

*Advanced filtering options including price range, bedrooms, location, and more*

### Swager docs apis link : http://localhost:3001/docs/#/
<img width="1528" height="774" alt="image" src="https://github.com/user-attachments/assets/efc58f5f-7d3e-4b12-ba5b-cda42ad80337" />


## 📊 Available Services

The application consists of three main services:

### 1. Database Service (`apartments_db`)
- **Image**: MySQL 8.0
- **Port**: 3306
- **Persistent Storage**: MySQL data volume
- **Health Check**: Automatic MySQL ping check

### 2. Backend Service (`apartments_backend`)
- **Framework**: NestJS
- **Port**: 3001 (mapped from container port 3000)
- **Dependencies**: Database service
- **Auto-restart**: Enabled

### 3. Frontend Service (`apartments_frontend`)
- **Framework**: Next.js
- **Port**: 3000
- **Dependencies**: Backend service
- **Auto-restart**: Enabled

## 🔧 Development Commands

### Using Makefile (Recommended)
```bash
# Start services
make up

# Stop services
make down

# Restart services
make restart

# View logs
make logs

# Run backend tests
make test

# Run linting
make lint

# Format code
make format

# Access backend shell
make shell

# Install backend dependencies
make install
```

### Direct Docker Commands
```bash
# Backend shell access
docker-compose exec backend bash

# Frontend shell access
docker-compose exec frontend sh

# Run backend tests
docker-compose exec backend npm run test

# Run backend in development mode
docker-compose exec backend npm run start:dev

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

## 🗄️ Database Management

### Database Initialization
- Database schema is automatically initialized using `/database/init.sql`
- Persistent data is stored in the `mysql_data` Docker volume

### Database Access
```bash
# Connect to MySQL from host
mysql -h localhost -P 3306 -u apartments_user -p apartments_db

# Or access via Docker
docker-compose exec database mysql -u apartments_user -p apartments_db
```

### Database Operations
```bash
# Run migrations
make migrate

# Create new migration
make make-migration

# Seed database
make seed
```

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
make test

# Run tests in watch mode
make test-watch

# Run tests with coverage
make test-coverage

# Debug tests
make test-debug
```

## 🔍 Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Health Checks
- Database service includes automatic health checks
- Backend waits for database to be healthy before starting
- Frontend waits for backend to be ready

### Container Status
```bash
# Check running containers
docker-compose ps

# Check container resource usage
docker stats
```

## 🛡️ Security Considerations

- Database credentials are defined in `docker-compose.yml`
- For production, use environment files (`.env`) instead of hardcoded values
- Consider using Docker secrets for sensitive data
- Database is only accessible within the Docker network by default

## 📁 Project Structure

```
apartments/
├── backend/                 # NestJS backend application
│   ├── src/                # Source code
│   ├── Dockerfile          # Backend container configuration
│   └── package.json        # Backend dependencies
├── frontend/               # Next.js frontend application
│   ├── src/                # Source code
│   ├── Dockerfile          # Frontend container configuration
│   └── package.json        # Frontend dependencies
├── database/               # Database initialization scripts
│   └── init.sql           # Database schema
├── docker-compose.yml      # Multi-container configuration
├── makefile               # Development commands
└── README.md              # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   lsof -i :3306
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose exec database mysqladmin ping -h localhost
   
   # Restart database service
   docker-compose restart database
   ```

3. **Build Failures**
   ```bash
   # Clean build (removes cached layers)
   docker-compose build --no-cache
   
   # Remove all containers and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up -d --build
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Reset Everything
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a -f

# Rebuild from scratch
docker-compose up -d --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

## 📝 License

This project is licensed under the UNLICENSED license.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Docker and application logs
3. Create an issue in the repository

---

**Happy coding! 🎉**
