# StudentOS - University Productivity & Management Dashboard

StudentOS is a premium, all-in-one university management and productivity dashboard designed to streamline every aspect of student life. Built with a modern tech stack, it provides a centralized, high-performance hub for academic planning, campus resources, community commerce, and administrative oversight.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6db33f?style=for-the-badge&logo=spring-boot&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Key Features

- **Personalized Student Dashboard**: A real-time overview of academic stats, pending tasks, and recent campus activities.
- **Admin Console**: Robust management panel for administrators to oversee users, moderate resources, and update campus services.
- **Study Planner**: Comprehensive task management with priority tracking, due date notifications, and automated scheduling.
- **Resource Hub**: Peer-to-peer academic resource sharing with advanced filtering and global search.
- **Student Marketplace**: Secure platform for campus-wide trading of books, electronics, and essentials.
- **Lost & Found Board**: Real-time community board with instant messaging for item recovery.
- **Tuition Fee Calculator**: Accurate fee estimation tailored to university-specific credit and waiver systems.
- **Social Messaging**: Integrated chat system for real-time collaboration between students.
- **Real-time Notifications**: Instant updates via WebSockets for system alerts and private messages.
- **Dark-First Modern UI**: Sleek, glassmorphic interface built with Tailwind CSS and Framer Motion animations.

## 🛠️ Technology Stack

### Frontend
- **React (Vite)**: Optimized single-page application framework.
- **Tailwind CSS**: Utility-first styling for a premium, responsive UI.
- **Framer Motion**: Smooth, high-fidelity animations and transitions.
- **WebSockets (STOMP/SockJS)**: Real-time full-duplex communication.
- **React Router 6**: Dynamic routing with protected/admin access levels.

### Backend
- **Spring Boot**: High-performance RESTful API architecture.
- **Spring Security + JWT**: Secure authentication and stateless session management.
- **Spring Data JPA**: Advanced ORM for MySQL database interactions.
- **STOMP Messaging**: WebSocket protocol for real-time events.
- **Lombok & SLF4J**: Clean boilerplate-free code with professional logging.

## 📁 Project Architecture

```text
studentOS/
├── frontend/             # React + Vite Application
│   ├── src/
│   │   ├── components/   # Atomic & Layout components
│   │   ├── hooks/        # Custom logic (WebSockets, Auth)
│   │   ├── context/      # Global State Management
│   │   └── pages/        # Main Dashboard & Admin Views
├── backend/              # Spring Boot Application
│   ├── src/main/java/    # MVC Architecture (Controller, Service, Repository)
│   └── src/main/resources # Application configuration & Database migrations
└── run-all.bat           # Automated environment launcher
```

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18.0+)
- **Java JDK** 17+
- **MySQL Server** 8.0+

### Quick Start
1. **Database**: Create a MySQL database named `studentos`.
2. **Environment**: Configure `backend/src/main/resources/application.properties` with your DB credentials.
3. **Execution**: Run the `run-all.bat` script in the root directory to launch both services simultaneously.

Alternatively, follow the manual setup:
- **Backend**: `cd backend && ./mvnw spring-boot:run`
- **Frontend**: `cd frontend && npm install && npm run dev`

## 📄 License
This project is developed as part of the AOOP Course (2026). All rights reserved.
