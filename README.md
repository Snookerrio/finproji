# 🍏 CRM System for Education Managers

A modern CRM solution designed for educational centers to streamline student lead management. This system empowers managers to process applications efficiently while providing administrators with robust tools for team management and data analytics.



## 🚀 Tech Stack
- Frontend: React (Vite), TypeScript, Tailwind CSS, Lucide React (icons).
- Backend: Node.js, Express, MongoDB (Mongoose), JWT.
- Tools: Axios, Bcrypt, XLSX (Data Export).

## 🛠 Key Features

### 🔐 Authentication & Security
- Secure Login: Email/Password authentication protected by Bcrypt hashing.
- Account Activation: Token-based activation system for new managers.
- JWT Protection: Secure access to private routes and API endpoints.

### 📋 Order Management
- Comprehensive Data Table: 15-column interactive table for detailed lead tracking.
- Expandable Rows: Quick-view interface to read original messages and add manager comments without leaving the page.
- Advanced Filtering: A two-level filtering system including text search, date ranges, courses, and lead types.
- Intelligent Pagination: Dynamic pagination with "dots" logic for easy navigation through large datasets.

### 👥 Group & Lead Logic
- Unique Group Management: Integrated "ADD/SELECT" logic allowing managers to assign leads to existing groups or create new ones on the fly.
- Role-Based Access (RBAC): Managers can only edit their own assigned leads, while admins have full override capabilities.

### ⚙️ Administration
- Team Control: Ban/Unban functionality for manager accounts.
- Token Recovery: Admin-generated recovery tokens for expired activation links or password resets.

## 📖 API Documentation (Swagger)
The project includes a fully interactive API documentation page powered by Swagger UI. It allows you to explore all endpoints, view request/response schemas, and test API calls directly from your browser.

- Access URL: `http://localhost:9000/api-docs` (while the backend is running)
- Features: Detailed parameter descriptions, authentication header support, and JSON examples.

## 🧪 API Testing (Postman)
To make testing easier, a Postman Collection is included in the project root:
- File: `CRM Final API.postman_collection.json`
- How to use:
   1. Open Postman and click Import.
   2. Drag and drop the JSON file or copy-paste its content into the Raw text tab.
   3. Use the `Login` request to receive a JWT token.
   4. Set the `jwt_token` variable in your Postman Collection/Environment to access protected routes.



## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas account or local MongoDB instance

### Backend Setup

1. Install dependencies:
    ```bash
   npm install
   
2. Create a .env file in the root of the server folder and configure your variables:
   PORT=9000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key

3. Start the development server:
    ```bash
     npx tsx backend/src/back/server.ts


### Frontend Setup (in new terminal window)
1. Navigate to the frontend directory:
    ```bash
   cd frontend
   
2. Install dependencies:
   ```bash
   npm install
   
3. Start the development environment:
    ```bash
   npm run dev
