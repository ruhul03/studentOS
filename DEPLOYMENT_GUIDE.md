# StudentOS Deployment Guide

This document outlines the step-by-step process used to deploy the StudentOS full-stack application for free across Vercel (Frontend), Render (Backend), and Aiven (Database).

## Architecture Overview
- **Frontend**: React (Vite) hosted on Vercel
- **Backend**: Spring Boot 3 + Java 17 hosted as a Docker Web Service on Render
- **Database**: MySQL 8 hosted on Aiven
- **Ping Monitor**: UptimeRobot (Keeps Render instance awake)

---

## 1. Database (Aiven MySQL)
1. Created a free MySQL 8 service on Aiven.
2. Retrieved the Service URI and converted it to a standard Spring Boot JDBC URL.
   - Example URI: `mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`
   - Converted to JDBC: `jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED`
3. **Migrated Data**:
   Used `mysqldump` locally and piped it directly into the remote Aiven instance using the Windows Command Prompt:
   ```cmd
   mysqldump -u root -p studentos > studentos_backup.sql
   cmd.exe /c "mysql -u avnadmin -p -h <AIVEN_HOST> -P <PORT> defaultdb < studentos_backup.sql"
   ```

---

## 2. Backend (Render)
### Codebase Changes
- Created a `Dockerfile` using a multi-stage Maven build (Eclipse Temurin 17) to containerize the application.
- Added a `PingController` (`/api/ping`) mapped to return `200 OK` to provide a lightweight health check endpoint.
- Configured `SecurityConfig.java` to `.permitAll()` for the `/api/ping` route.
- Updated `application.yml` to support production environment variables while retaining local fallbacks:
  ```yaml
  spring:
    datasource:
      url: ${DB_URL:jdbc:mysql://localhost:3306/studentos...}
      username: ${DB_USER:root}
      password: ${DB_PASSWORD:salman7?}
  jwt:
    secret: ${JWT_SECRET:yourLocalSecret}
  app:
    cors:
      allowed-origins: ${CORS_ORIGINS:http://localhost:5174}
  ```

### Deployment Configuration
- Deployed as a "Web Service" on Render linked to GitHub.
- Configured Environment Variables on Render:
  - `DB_URL`: The JDBC URL from Aiven.
  - `DB_USER`: `avnadmin`
  - `DB_PASSWORD`: Aiven password
  - `JWT_SECRET`: A secure, 64+ character random string.
  - `CORS_ORIGINS`: The Vercel URL (e.g., `https://studentos-client.vercel.app`) *without* a trailing slash.
  - `BREVO_API_KEY`: API key from Brevo dashboard for sending emails over HTTP.
  - `BREVO_FROM_EMAIL`: Verified sender email address configured in Brevo.

---

## 3. Frontend (Vercel)
### Codebase Changes
- Updated `.env.example` to document the production keys needed.
- No source code changes were required as Vite natively swaps `import.meta.env` references at build-time.

### Deployment Configuration
- Imported the GitHub repository into Vercel.
- Framework preset was automatically detected as Vite.
- Configured Environment Variables on Vercel:
  - `VITE_API_URL`: The Render backend URL (e.g., `https://studentos-api.onrender.com`)
  - `VITE_WS_URL`: The Render backend WebSocket URL (e.g., `https://studentos-api.onrender.com/ws-studentos`)
- Checked both "Production" and "Preview" environments for the variables.

---

## 4. Keep-Alive Configuration
Due to Render's free tier limitation (spinning down the web service after 15 minutes of inactivity), we set up a cron-ping to keep the JVM warm and avoid the 30-50 second cold start delay.

- Used **UptimeRobot** (or cron-job.org).
- Monitored the endpoint: `https://YOUR-RENDER-URL.onrender.com/api/ping`
- Set the ping interval to **14 minutes**.
