# CAMP Course Alignment And Mapping Portal

> An intelligent course management and outcome tracking platform leveraging AI to optimize educational program alignment and course design.

---

##  Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Configuration](#project-configuration)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

##  Overview

CAMP is a comprehensive educational management platform designed to help institutions streamline course design, align learning outcomes, and track program effectiveness. By integrating AI and Natural Language Processing capabilities, the platform provides intelligent insights into curriculum alignment and educational quality assurance.

**Developed for:** AICT College of Engineering

---

##  Key Features

- **Course Management** - Create, organize, and manage courses with detailed metadata
- **Outcome Tracking** - Define and monitor Course Outcomes (CO) and Program Outcomes (PO)
- **AI-Driven Analysis** - Intelligent NLP processing for curriculum insights
- **Responsive UI** - Modern, user-friendly interface for seamless interaction
- **Real-time Data Processing** - Efficient backend services for instant feedback
- **Extensible Architecture** - Easy integration with additional AI/ML models

---

##  Technology Stack

### Backend
- **Framework:** Spring Boot (Java)
- **Build Tool:** Maven (mvnw)
- **Architecture:** REST API with Service-Repository pattern
- **NLP/AI:** Custom NLP Service with AI Tools integration

### Frontend
- **UI:** HTML5, CSS3,  JavaScript
- **Architecture:** Client-side MVC pattern
- **Integration:** RESTful API consumption

### Database
- PostgreSQL (implied from Spring Boot configuration)

---

## Project Structure

```
EduMap-AIApplication/
├── Frontend/                          # Web UI
│   ├── index.html                     # Main application page
│   ├── script.js                      # Frontend logic
│   ├── style.css                      # Styling
│   └── README.md                      # Frontend documentation
│
├── BackEnd/                           # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/example/edumap/
│   │       ├── BackEndApplication.java       # Application entry point
│   │       ├── Configuration/
│   │       │   └── AIConfig.java             # AI configuration
│   │       ├── Entity/
│   │       │   ├── Course.java               # Course entity
│   │       │   ├── CourseOutcomes.java       # Course Outcomes entity
│   │       │   ├── ProgramOutcomes.java      # Program Outcomes entity
│   │       │   └── Enum/
│   │       │       └── ProgramOutcome_Constants.java
│   │       ├── Repository/                   # Data access layer
│   │       │   ├── CourseRepo.java
│   │       │   └── CourseOutcomesRepo.java
│   │       └── Service/                      # Business logic
│   │           ├── AiTools.java
│   │           └── NlpService.java
│   ├── src/main/resources/
│   │   └── application.properties     # Application configuration
│   ├── pom.xml                        # Maven dependencies
│   └── mvnw                           # Maven wrapper
│
└── Reports/                           # Documentation & reports

```

---

## Prerequisites

- **Java Development Kit (JDK):** 11 or higher
- **Maven:** 3.6+ (included via mvnw)
- **Node.js/npm:** (Optional, for frontend build tools)
- **PostgreSQL:** 12 or higher
- **Git:** For version control

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Frontend
```

### 2. Backend Setup

Navigate to the BackEnd directory:

```bash
cd BackEnd
```

#### Configure Database

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/edumap
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# Server Configuration
server.port=8080
server.servlet.context-path=/api
```

#### Build the Project

```bash
# Using Maven wrapper (Windows)
mvnw.cmd clean install

# Or using Maven directly
maven clean install
```

### 3. Frontend Setup

Navigate to the Frontend directory:

```bash
cd ../Frontend
```

No additional dependencies required for basic HTML/CSS/JS setup. For production, consider setting up a build pipeline.

---

##  Running the Application

### Start Backend Server

```bash
cd BackEnd

# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### Start Frontend

Open the frontend in your browser:

```bash
# Navigate to Frontend directory and open index.html
start index.html  # Windows
open index.html   # macOS
xdg-open index.html # Linux
```

Or use a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if installed)
npx http-server
```

Frontend will be available at: `http://localhost:8000`

---

##  Project Configuration

### Spring Boot Configuration

Key configurations in `BackEnd/src/main/resources/application.properties`:

- **Database Connection:** PostgreSQL connection string and credentials
- **JPA/Hibernate:** Entity mapping and DDL strategy
- **Server Port:** Default 8080
- **Context Path:** API endpoints prefixed with `/api`

### AI/NLP Configuration

Configure AI model integrations in `BackEnd/src/main/java/com/example/edumap/Configuration/AIConfig.java`

---

##  API Overview

### Base URL
```
http://localhost:8080/api
```

### Main Endpoints

#### Courses
- `GET /courses` - Retrieve all courses
- `POST /courses` - Create new course
- `GET /courses/{id}` - Get course details
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course

#### Course Outcomes
- `GET /course-outcomes` - List all course outcomes
- `POST /course-outcomes` - Create course outcome
- `GET /course-outcomes/{id}` - Get outcome details

#### Program Outcomes
- `GET /program-outcomes` - List all program outcomes
- `POST /program-outcomes` - Create program outcome

#### AI Analysis
- `POST /analyze` - Submit content for NLP analysis
- `GET /insights` - Retrieve AI-generated insights

**For detailed API documentation**, refer to the Swagger/OpenAPI documentation at `/api/swagger-ui.html`

### Code Standards
- Follow Java naming conventions (camelCase)
- Use meaningful commit messages
- Add comments for complex logic
- Ensure backward API compatibility

---
