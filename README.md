# AI-Powered School Management Dashboard

Portfolio project for an **AI-Assisted Web Developer specializing in backend APIs, automations, and business workflow integrations**.

This project shows that you can build a practical web app, design REST APIs, connect to a database, and automate routine business reporting.

## What It Demonstrates

- Backend services with `Node.js` and `Express`
- REST API design for students, attendance, and grades
- MongoDB Atlas integration with `Mongoose`
- Small automations for attendance reports and email digests
- A clean dashboard UI served by the API
- Deployment-ready environment configuration

## Core Features

- View school performance metrics
- Manage student records
- Record attendance by date
- Track grades by subject
- Generate CSV attendance summaries
- Send attendance summary emails with SMTP

## Tech Stack

- `Node.js`
- `Express`
- `MongoDB Atlas`
- `Mongoose`
- `HTML`, `CSS`, and vanilla `JavaScript`
- Optional deployment on `AWS`, Render, or Railway

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Add your `MONGODB_URI` to `.env`.

4. Seed sample data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Dashboard metrics |
| GET | `/api/students` | List students |
| POST | `/api/students` | Create student |
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance` | Record attendance |
| GET | `/api/grades` | List grade records |
| POST | `/api/grades` | Add grade |
| POST | `/api/automations/attendance-report` | Generate CSV attendance report |
| POST | `/api/automations/email-summary` | Email attendance summary |

## Portfolio Case Study Angle

**Problem:** School administrators need a simple way to track attendance and grades without jumping between spreadsheets, emails, and separate systems.

**Solution:** A full-stack dashboard with backend APIs, MongoDB persistence, and automation endpoints that generate and send attendance summaries.

**Developer Value:** This project shows practical backend development, integration thinking, automation skills, and the ability to use AI tools to move faster while still producing maintainable code.

## Next Upgrades

- Add authentication and role-based permissions
- Connect Google Sheets as an automation target
- Deploy the API on AWS Elastic Beanstalk or Render
- Add OpenAI-generated absence risk summaries
- Add API documentation with Swagger
