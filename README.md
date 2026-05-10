# Vayl Setup Guide

This guide will help you set up and run the Vayl project on a new system.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v22 or higher recommended)
- **npm** (comes with Node.js)
- **MongoDB** (Local instance running on port 27017)

---

## 1. Local MongoDB Setup

The project uses MongoDB as its database. Follow these steps to connect to a local instance:

1.  **Install MongoDB:** Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2.  **Start MongoDB Service:** Ensure the MongoDB service is running. On Windows, you can check this in the "Services" app or run `mongod` in a terminal.
3.  **Database URI:** By default, the app connects to `mongodb://localhost:27017/vayl`. You don't need to manually create the database; Mongoose will create it for you when the server starts.

---

## 2. Server Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm i
    ```
3.  **Configure Environment Variables:**
    - Create a file named `.env` in the `server` directory.
    - Copy the contents from `.env.example` into `.env`.
    - Ensure `MONGO_URI` is set to `mongodb://localhost:27017/vayl`.
    - Set a `JWT_SECRET` (e.g., `JWT_SECRET=any_random_string`).
4.  **Start the Server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

---

## 3. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd client/frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm i
    ```
3.  **Configure Environment Variables:**
    - Ensure `.env.local` exists (or create it).
    - It should contain:
      ```env
      NEXT_PUBLIC_API_URL=http://localhost:5000
      ```
4.  **Start the Frontend:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

---

## Project Structure

- `/server`: Node.js/Express backend.
- `/design`: Contains Frontend Designs of the Apps.
- `/client/frontend`: Next.js frontend application.
- `/client/jee-battle`: Next.js JEE Battle frontend application.
- `/client/test-dashboard`: Next.js Tests Dashboard for JEE Studs.
- `/client/physics-engine`: Next.js Physics Engine for JEE Studs.
- `/shared`: Shared types or utilities (if any).
