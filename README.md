# StudentOS - University Dashboard

StudentOS is a comprehensive university management and productivity dashboard designed to streamline student life. It provides a centralized hub for campus resources, services, academic planning, and community interaction.

## 🚀 Features

- **Personalized Dashboard**: A central overview of student activities and notifications.
- **Resource Sharing**: A feed for students to upload and share academic resources.
- **Campus Services**: A directory of essential university services and contact information.
- **Study Planner**: Tools to organize tasks, deadlines, and study schedules.
- **Lost & Found Board**: A community board to report and find lost items on campus.
- **Student Marketplace**: A platform for students to buy and sell books, gear, and other items.
- **Course Reviews**: Transparent student-led reviews and ratings for university courses.
- **Real-time Notifications**: Instant updates via WebSockets for campus announcements and activities.
- **Global Search**: Quickly find anything across the entire platform.

## 🛠️ Tech Stack

### Frontend
- **React**: Modern UI library for a responsive experience.
- **Vite**: Ultra-fast build tool and development server.
- **Lucide React**: Sleek and consistent icon system.
- **React Router**: Seamless single-page navigation.
- **WebSockets**: Real-time data synchronization.

### Backend
- **Spring Boot**: Robust Java framework for the RESTful API.
- **Spring Data JPA**: Efficient database abstraction and ORM.
- **MySQL**: Reliable relational database for persistent storage.
- **WebSockets (STOMP)**: Real-time notification infrastructure.
- **Lombok**: Reduced boilerplate code for cleaner Java models.

## 📁 Project Structure

```text
studentOS/
├── frontend/           # React + Vite frontend application
│   ├── src/
│   │   ├── components/ # Modularized UI components
│   │   ├── pages/      # Main application views
│   │   └── context/    # State management and Auth providers
├── backend/            # Spring Boot backend application
│   ├── src/main/java/  # Java source code (MVC architecture)
│   └── pom.xml         # Maven dependencies
└── README.md           # Project documentation
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Java JDK 17
- MySQL Server

### Backend Setup
1. Navigate to the `backend` folder.
2. Configure your database in `src/main/resources/application.properties`.
3. Run the application using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set your API URL.
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License
This project is developed for educational purposes as part of the AOOP course.
