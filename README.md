# StudentOS - University Productivity & Management Dashboard

StudentOS is a premium, all-in-one university management and productivity dashboard designed to streamline every aspect of student life. Built with a modern tech stack, it provides a centralized, high-performance hub for academic planning, campus resources, community commerce, and administrative oversight.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6db33f?style=for-the-badge&logo=spring-boot&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Key Features

- **Personalized Student Dashboard**: A real-time overview of academic stats, pending tasks, and recent campus activities.
- **Admin Console**: Robust management panel for administrators to oversee users, moderate resources, and update campus services.
- **Real-Time Centralized Inbox**: Full-screen, two-pane messaging layout integrated with WebSockets (STOMP) for live peer-to-peer chat.
- **Study Planner**: Comprehensive task management with priority tracking, due date notifications, and automated weekly calendar scheduling.
- **Resource Hub**: Peer-to-peer academic resource sharing with advanced filtering, global search, and inline editing.
- **Student Marketplace**: Secure platform for campus-wide trading of books and electronics (Prices localized to ৳ BDT).
- **Lost & Found Board**: Real-time community board with instant messaging for item recovery and status tracking.
- **Tuition Fee Calculator**: Accurate fee estimation tailored to university-specific credit and waiver systems.
- **Course & Faculty Reviews**: Transparent review system allowing students to request and write reviews for specific courses.
- **Secure Authentication & Verification**: JWT-based stateless authentication with a complete email verification and password reset flow powered by the Brevo HTTP API.
- **Dark-First Modern UI**: Sleek, glassmorphic interface built with Tailwind CSS variables and Framer Motion animations, optimized for absolute speed via `React.lazy()` micro-chunking.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Dynamic Light/Dark Themes)
- **Animations**: Framer Motion
- **State Management**: TanStack React Query (Server State) & Context API
- **Real-time**: SockJS + STOMP (WebSockets)
- **Routing**: React Router 6

### Backend
- **Framework**: Java 17 + Spring Boot 3.2.x
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA (Hibernate)
- **Database**: MySQL 8.0 (Hosted on Aiven)
- **Email Delivery**: Brevo HTTP API via Java `HttpClient`
- **Real-time**: Spring WebSocket STOMP

## ⚙️ Getting Started (Local Development)

### Prerequisites
- **Node.js** (v18.0+)
- **Java JDK** 17+
- **MySQL Server** 8.0+

### 1. Database Setup
1. Create a MySQL database named `studentos`.
2. Configure your credentials in `backend/src/main/resources/application.yml`.

### 2. Environment Variables
You will need to set the following environment variables (or rely on their local defaults in `application.yml`):
- `BREVO_API_KEY`: Your API key from Brevo.com (for sending verification emails).
- `BREVO_FROM_EMAIL`: Your verified sender email on Brevo.
- `JWT_SECRET`: A secure 64+ character string for token generation.

### 3. Execution
Run the `run-all.bat` script in the root directory. It features a robust Text User Interface (TUI) to launch both the frontend and backend services simultaneously.

Alternatively, follow the manual setup:
- **Backend**: `cd backend` then `./mvnw spring-boot:run` (Runs on port `8081`)
- **Frontend**: `cd frontend` then `npm install` and `npm run dev` (Runs on port `5174`)

---

## 🚀 Production Deployment Architecture

StudentOS is fully containerized and deployed using modern PaaS and DBaaS providers:

- **Frontend (Vercel)**: Deployed as a static React/Vite site. Automatically rebuilt on pushes to GitHub. The frontend environment is securely linked to the backend via `VITE_API_URL` and `VITE_WS_URL`.
- **Backend API (Render)**: Deployed as a Docker Web Service. The application runs Spring Boot 3 inside an `eclipse-temurin:17-jre-alpine` container, optimized with strict JVM memory limits to operate within Render's 512MB free tier constraint.
- **Database (Aiven)**: Uses a managed MySQL 8.0 instance. Connected via standard JDBC configuration.
- **Email (Brevo)**: Uses the Brevo REST API over standard HTTP (port 443) to bypass Render's strict outbound SMTP port blocking (ports 25, 465, 587).
- **Keep-Alive**: A lightweight `/api/ping` endpoint is pinged every 14 minutes by UptimeRobot to prevent the Render instance from spinning down and causing cold starts.

## 📄 License
This project is developed as part of the AOOP Course (2026). All rights reserved.
