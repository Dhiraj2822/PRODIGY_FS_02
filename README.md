# Employee Management System

A modern, secure web application for managing employee records with full CRUD operations and administrative authentication.

## Features

- **Secure Authentication**: Admin-only access with JWT tokens and password hashing
- **Complete CRUD Operations**: Create, read, update, and delete employee records
- **Data Validation**: Comprehensive client-side and server-side validation
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Feedback**: Toast notifications and error handling
- **Search & Filter**: Find employees quickly by name, email, or department
- **Dashboard Analytics**: Overview of employee statistics and recent hires

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **XAMPP** (for MySQL database)
- **Git** (for cloning the repository)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd employee-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Start XAMPP Services
1. Open XAMPP Control Panel
2. Start **Apache** service
3. Start **MySQL** service
4. Verify both services show "Running" status

#### Database Configuration
The application will automatically create the database and tables when you first run it.

### 4. Environment Configuration

#### Copy Environment File
```bash
cp .env.example .env
```

#### Configure Environment Variables
Edit the `.env` file with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=employee_management_system
DB_PORT=3306

# JWT Secret (IMPORTANT: Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
```

**⚠️ Security Note**: Always change the `JWT_SECRET` to a strong, unique value in production!

### 5. Run the Application

#### Development Mode
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 5173).

#### Production Build
```bash
npm run build
npm run preview
```

## Usage

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Accessing the Application
1. Open your browser and go to `http://localhost:5173`
2. Sign in with the admin credentials
3. Start managing employee records!

## Project Structure

```
employee-management-system/
├── server/
│   ├── config/
│   │   └── database.js          # Database configuration
│   └── server.js                # Express server and API routes
├── src/
│   ├── components/              # Reusable React components
│   ├── contexts/                # React context providers
│   ├── pages/                   # Application pages
│   └── main.tsx                 # Application entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── package.json                 # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

### Employee Management
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation on both client and server
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data stored securely

## Database Schema

### Admins Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique identifier |
| username | VARCHAR(50) | Admin username |
| password | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Account creation time |

### Employees Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique identifier |
| first_name | VARCHAR(50) | Employee first name |
| last_name | VARCHAR(50) | Employee last name |
| email | VARCHAR(100) | Employee email (unique) |
| position | VARCHAR(100) | Job position |
| department | VARCHAR(100) | Department |
| salary | DECIMAL(10,2) | Annual salary |
| hire_date | DATE | Date of hiring |
| phone | VARCHAR(20) | Phone number (optional) |
| address | TEXT | Address (optional) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Ensure XAMPP MySQL service is running
- Check database credentials in `.env` file
- Verify MySQL is running on port 3306

#### Port Already in Use
- Change the PORT in `.env` file
- Kill existing processes using the port

#### Login Issues
- Use default credentials: `admin` / `admin123`
- Clear browser localStorage if needed
- Check browser console for errors

### Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure XAMPP services are running
4. Check the browser developer console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies
- Designed for learning full-stack development
- Follows security best practices
- Responsive design principles applied