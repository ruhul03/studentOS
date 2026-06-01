# StudentOS API Documentation for Postman

## Base Configuration

- **Base URL**: `http://localhost:8081`
- **Port**: 8081
- **Authentication**: JWT Token (Bearer Token)

---

## Authentication Setup

### 1. Register User

**Endpoint**: `POST /api/auth/register`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response** (201):

```json
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "STUDENT"
}
```

---

### 2. Login User

**Endpoint**: `POST /api/auth/login`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response** (200):

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "STUDENT"
}
```

---

### 3. Forgot Username

**Endpoint**: `POST /api/auth/forgot-username`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john@example.com"
}
```

---

### 4. Request Password Reset

**Endpoint**: `POST /api/auth/request-password-reset`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john@example.com"
}
```

---

### 5. Verify Email

**Endpoint**: `POST /api/auth/verify`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

---

## Authorization Header (Required for Protected Endpoints)

For all endpoints marked with 🔒, add this header:

```
Authorization: Bearer {token}
```

Replace `{token}` with the token received from login/register.

---

## USER MANAGEMENT

### 1. Get User Profile 🔒

**Endpoint**: `GET /api/users/{id}`

**Example**: `GET /api/users/1`

**Response** (200):

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Computer Science student",
  "profilePicture": "url",
  "department": "CS",
  "batch": "2024",
  "studentId": "S-001"
}
```

---

### 2. Update User Profile 🔒

**Endpoint**: `PUT /api/users/{id}`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "username": "johndoe",
  "bio": "Updated bio",
  "profilePicture": "url",
  "department": "CS",
  "batch": "2024",
  "studentId": "S-001",
  "dateOfBirth": "2003-05-15",
  "phoneNumber": "+880123456789"
}
```

---

### 3. Get User Dashboard Stats 🔒

**Endpoint**: `GET /api/users/{id}/stats`

**Example**: `GET /api/users/1/stats`

---

### 4. Get User Activities 🔒

**Endpoint**: `GET /api/users/{id}/activities?limit=10`

**Example**: `GET /api/users/1/activities?limit=10`

---

### 5. Delete User Profile 🔒

**Endpoint**: `DELETE /api/users/{id}`

**Headers**:

```
Authorization: Bearer {token}
```

---

## RESOURCES

### 1. Get All Resources

**Endpoint**: `GET /api/resources`

**Query Params**:

- `query` (optional): Search by course code or title

**Example**: `GET /api/resources?query=CSE101`

**Response** (200):

```json
[
  {
    "id": 1,
    "title": "CSE101 Notes",
    "description": "Complete notes for CSE101",
    "courseCode": "CSE101",
    "courseTitle": "Programming",
    "type": "notes",
    "fileUrl": "url",
    "uploader": {...},
    "upvotes": 5,
    "anonymous": false,
    "createdAt": "2024-05-16T10:00:00"
  }
]
```

---

### 2. Get Single Resource

**Endpoint**: `GET /api/resources/{id}`

**Example**: `GET /api/resources/1`

---

### 3. Upload Resource 🔒

**Endpoint**: `POST /api/resources`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data**:

- `resource` (JSON): Resource metadata
- `file` (File): Resource file (optional if fileUrl provided)

**Resource JSON**:

```json
{
  "title": "CSE101 Lecture Notes",
  "description": "Complete notes",
  "courseCode": "CSE101",
  "courseTitle": "Programming Basics",
  "type": "notes",
  "fileUrl": "optional_url_if_no_file",
  "anonymous": false
}
```

---

### 4. Delete Resource 🔒

**Endpoint**: `DELETE /api/resources/{id}`

**Headers**:

```
Authorization: Bearer {token}
X-User-Id: {userId}
X-User-Role: {role}
```

---

### 5. Upvote Resource 🔒

**Endpoint**: `POST /api/resources/{id}/upvote`

**Headers**:

```
Authorization: Bearer {token}
```

---

## EVENTS

### 1. Get All Events

**Endpoint**: `GET /api/events`

**Response** (200):

```json
[
  {
    "id": 1,
    "title": "Tech Fest 2024",
    "description": "Annual tech fest",
    "location": "Main Auditorium",
    "eventDate": "2024-06-15T10:00:00",
    "organizer": "Student Association",
    "uploaderId": 1
  }
]
```

---

### 2. Create Event 🔒

**Endpoint**: `POST /api/events`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Tech Fest 2024",
  "description": "Annual tech fest",
  "location": "Main Auditorium",
  "eventDate": "2024-06-15T10:00:00",
  "organizer": "Student Association",
  "uploaderId": 1
}
```

---

### 3. Update Event 🔒

**Endpoint**: `PUT /api/events/{id}`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: Same as Create Event

---

### 4. Delete Event 🔒

**Endpoint**: `DELETE /api/events/{id}`

**Headers**:

```
Authorization: Bearer {token}
```

---

## CAMPUS SERVICES

### 1. Get All Services

**Endpoint**: `GET /api/services`

**Query Params**:

- `category` (optional): Filter by category (Library, Medical, Food, Transport)

**Example**: `GET /api/services?category=Medical`

**Response** (200):

```json
[
  {
    "id": 1,
    "name": "Central Library",
    "description": "Main campus library",
    "category": "Library",
    "location": "Building A",
    "operatingHours": "08:00 AM - 05:00 PM",
    "contactInfo": "library@uiu.edu",
    "status": "open"
  }
]
```

---

### 2. Create Service (ADMIN ONLY) 🔒

**Endpoint**: `POST /api/services`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Campus Clinic",
  "description": "Medical services",
  "category": "Medical",
  "location": "Building B",
  "operatingHours": "09:00 AM - 04:00 PM",
  "contactInfo": "clinic@uiu.edu",
  "adminName": "Admin Name"
}
```

---

### 3. Update Service (ADMIN ONLY) 🔒

**Endpoint**: `PUT /api/services/{id}`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: Same as Create Service

---

### 4. Delete Service (ADMIN ONLY) 🔒

**Endpoint**: `DELETE /api/services/{id}`

**Headers**:

```
Authorization: Bearer {token}
```

---

## MARKETPLACE

### 1. Get Available Items

**Endpoint**: `GET /api/marketplace`

**Query Params**:

- `category` (optional): Filter by category

**Example**: `GET /api/marketplace?category=Books`

**Response** (200):

```json
[
  {
    "id": 1,
    "title": "Physics Textbook",
    "description": "Used textbook in good condition",
    "price": 1500,
    "condition": "Good",
    "category": "Books",
    "contactInfo": "+880123456789",
    "seller": {...},
    "sold": false,
    "listedAt": "2024-05-16T10:00:00"
  }
]
```

---

### 2. Create Listing 🔒

**Endpoint**: `POST /api/marketplace`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Physics Textbook",
  "description": "Used textbook",
  "price": 1500,
  "condition": "Good",
  "category": "Books",
  "contactInfo": "+880123456789",
  "photosJson": "[]"
}
```

---

### 3. Update Listing 🔒

**Endpoint**: `PUT /api/marketplace/{id}`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: Same as Create Listing

---

### 4. Delete Listing 🔒

**Endpoint**: `DELETE /api/marketplace/{id}`

**Headers**:

```
Authorization: Bearer {token}
```

---

## STUDY PLANNER

### 1. Get User Tasks 🔒

**Endpoint**: `GET /api/planner/user/{userId}`

**Query Params**:

- `completed` (optional): true/false

**Example**: `GET /api/planner/user/1?completed=false`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 2. Create Task 🔒

**Endpoint**: `POST /api/planner`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Complete Assignment",
  "description": "Assignment 1 for CSE101",
  "courseCode": "CSE101",
  "type": "assignment",
  "dueDate": "2024-05-20"
}
```

---

### 3. Toggle Task Completion 🔒

**Endpoint**: `PUT /api/planner/{taskId}/toggle`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 4. Update Task 🔒

**Endpoint**: `PUT /api/planner/{taskId}`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: Same as Create Task

---

### 5. Delete Task 🔒

**Endpoint**: `DELETE /api/planner/{taskId}`

**Headers**:

```
Authorization: Bearer {token}
```

---

## COURSE REVIEWS

### 1. Get Reviews

**Endpoint**: `GET /api/reviews`

**Query Params**:

- `courseCode` (optional): Filter by course

**Example**: `GET /api/reviews?courseCode=CSE101`

**Response** (200):

```json
[
  {
    "id": 1,
    "courseCode": "CSE101",
    "courseName": "Programming Basics",
    "professor": "Dr. Ahmed",
    "difficultyRating": 4,
    "qualityRating": 5,
    "reviewText": "Great course",
    "reviewer": {...},
    "helpfulVotes": 3,
    "anonymous": false,
    "createdAt": "2024-05-16T10:00:00"
  }
]
```

---

### 2. Create Review 🔒

**Endpoint**: `POST /api/reviews`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "courseCode": "CSE101",
  "courseName": "Programming Basics",
  "professor": "Dr. Ahmed",
  "difficultyRating": 4,
  "qualityRating": 5,
  "reviewText": "Great course, very informative",
  "reviewerId": 1,
  "anonymous": false
}
```

---

### 3. Update Review 🔒

**Endpoint**: `PUT /api/reviews/{id}`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: Same as Create Review

---

### 4. Delete Review 🔒

**Endpoint**: `DELETE /api/reviews/{id}`

**Headers**:

```
Authorization: Bearer {token}
```

---

## LOST & FOUND

### 1. Get Active Items

**Endpoint**: `GET /api/lostfound`

**Query Params**:

- `type` (optional): Lost or Found

**Example**: `GET /api/lostfound?type=Lost`

**Response** (200):

```json
[
  {
    "id": 1,
    "title": "Blue Backpack",
    "description": "Lost in library",
    "type": "Lost",
    "location": "Library",
    "contactInfo": "+880123456789",
    "reporter": {...},
    "resolved": false,
    "reportedAt": "2024-05-16T10:00:00"
  }
]
```

---

### 2. Report Item 🔒

**Endpoint**: `POST /api/lostfound`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Blue Backpack",
  "description": "Lost near library",
  "type": "Lost",
  "location": "Library",
  "contactInfo": "+880123456789"
}
```

---

### 3. Resolve Item 🔒

**Endpoint**: `PUT /api/lostfound/{id}/resolve`

**Headers**:

```
Authorization: Bearer {token}
```

---

## MESSAGES

### 1. Send Message 🔒

**Endpoint**: `POST /api/messages/send`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "senderId": 1,
  "receiverId": 2,
  "content": "Hey, how are you?"
}
```

---

### 2. Get Conversation

**Endpoint**: `GET /api/messages/conversation?user1={id1}&user2={id2}`

**Example**: `GET /api/messages/conversation?user1=1&user2=2`

---

## NOTIFICATIONS

### 1. Get User Notifications 🔒

**Endpoint**: `GET /api/notifications/{userId}`

**Example**: `GET /api/notifications/1`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 2. Create Notification 🔒

**Endpoint**: `POST /api/notifications`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "recipientId": 2,
  "type": "reminder",
  "title": "Task Due",
  "message": "Your assignment is due tomorrow",
  "senderId": 1,
  "relatedEntityId": null
}
```

---

### 3. Mark Notification as Read 🔒

**Endpoint**: `PUT /api/notifications/{id}/read`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 4. Broadcast Notification (ADMIN) 🔒

**Endpoint**: `POST /api/notifications/broadcast`

**Headers**:

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**: Plain text message

---

## ADMIN ENDPOINTS (ADMIN ONLY)

### 1. Get System Stats 🔒

**Endpoint**: `GET /api/admin/stats`

**Headers**:

```
Authorization: Bearer {token}
```

**Response** (200):

```json
{
  "totalUsers": 100,
  "totalResources": 50,
  "totalMarketplaceItems": 25,
  "totalEvents": 10,
  "totalLostFoundItems": 5
}
```

---

### 2. Get System Health 🔒

**Endpoint**: `GET /api/admin/health`

**Headers**:

```
Authorization: Bearer {token}
```

**Response** (200):

```json
{
  "status": "healthy",
  "totalMemory": 2147483648,
  "freeMemory": 1073741824,
  "usedMemory": 1073741824,
  "activeThreads": 50,
  "uptime": 3600000
}
```

---

### 3. Get All Users (ADMIN) 🔒

**Endpoint**: `GET /api/admin/users`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 4. Get Admin Resources 🔒

**Endpoint**: `GET /api/admin/resources`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 5. Get Admin Marketplace 🔒

**Endpoint**: `GET /api/admin/marketplace`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 6. Get Admin Events 🔒

**Endpoint**: `GET /api/admin/events`

**Headers**:

```
Authorization: Bearer {token}
```

---

### 7. Get Admin Analytics 🔒

**Endpoint**: `GET /api/admin/analytics/growth`

**Headers**:

```
Authorization: Bearer {token}
```

---

## POSTMAN Collection Setup

### 1. Set Environment Variable

Create an environment in Postman with:

- Variable: `BASE_URL` = `http://localhost:8081`
- Variable: `token` = (Will be set dynamically after login)

### 2. Postman Script (Auto-save Token)

In **Login** request → **Tests** tab, add:

```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.token);
}
```

### 3. Use in Requests

- URL: `{{BASE_URL}}/api/auth/login`
- Header: `Authorization: Bearer {{token}}`

---

## Common Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Dates should be in format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`
- Make sure MySQL is running before testing
- Backend must be running on `http://localhost:8081`
