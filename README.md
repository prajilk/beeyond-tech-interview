
# Project Assessment

This project is a full-stack application built using the Nextjs and Express.

## Table of Contents
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Technologies Used](#technologies-used)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/prajilk/beeyond-tech-interview.git .
    ```

2. **Install server dependencies:**

    ```bash
    cd server
    npm install
    ```

3. **Install client dependencies:**

    ```bash
    cd ..
    npm install
    ```

## Environment Variables

Create `.env.local` files in the root directories with the following configurations:

### `.env.local` file

```
MONGODB_URI = mongodb://127.0.0.1:27017/quickcommerce
NEXTAUTH_SECRET = jwt_secret
NEXTAUTH_URL = http://localhost:3000
NEXT_PUBLIC_SOCKET_SERVER_URL = http://localhost:5000
```

## Running the Project

### Run the socket server:

Open a terminal and navigate to the server directory, then start the server:

```
cd server && npm start
```
### Run the Nextjs server:

Open another terminal and navigate to the client directory, then start the client:

```
npm run dev
```
### Access the application:

Open your browser and navigate to http://localhost:3000.

## Technologies Used
### Fronend + Backend:
- Nextjs
- Tailwindcss for styling
- Shadcn for UI Components
- MongoDB
- Mongoose
- Next auth
### Backend:
- Node.js
- Express.js
- socket.io

## LIVE DEMO
Click here to see live demo:
http://13.233.70.51

