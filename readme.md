# Jobly Backend

## Overview
Express backend for the Jobly application, providing APIs for job and user management.

## Technologies Used
- **Node.js**: For server-side logic.
- **Express.js**: Web application framework for Node.js.
- **PostgreSQL**: Relational database to store application data.
- **JSON Web Tokens (JWT)**: For secure user authentication.
- **bcrypt**: For password hashing.

## Features
- User registration and authentication.
- Job listings: Users can view and apply to jobs.
- Company listings: Users can view companies and their job postings.
- User profile management.

## Installation
To run this backend, follow these steps:

1. Clone the repository: 
```git clone https://github.com/jencegram/jobly.git```
2. Install dependencies: 
```npm install```
3. Set up PostgreSQL database and configure `.env` file.
4. Start the server: 
```node server.js```

## Running Tests
Before running tests, ensure all dependencies are installed.
```jest -i```

