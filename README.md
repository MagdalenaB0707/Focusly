# Focusly — Study Tracking Mobile App

Focusly is a hybrid mobile application built with Angular and Ionic that helps students track their study sessions, monitor progress toward learning goals, and stay consistent with their habits.

## Features

- **Authentication** — Register and log in securely via Firebase Authentication
- **Activity & Course Tracking** — Create activities or courses and log how much time you spent on each session
- **Session Logging** — Record individual study sessions with duration for any activity or course
- **Goal Setting** — Set goals tied to specific activities or courses; progress is automatically calculated based on logged sessions
- **Real-time Data** — All data is stored and synced in real time using Firebase Realtime Database

## Data Models

- `User` — authenticated user profile
- `Activity` — a general study activity (e.g. reading, practice)
- `Course` — a specific course being studied
- `Session` — a logged study session linked to an activity or course, with duration
- `Goal` — a target linked to an activity or course; tracks completion percentage based on sessions

## Tech Stack

- **Frontend:** Angular, Ionic, TypeScript, SCSS
- **Backend/Database:** Firebase Authentication, Firebase Realtime Database
- **Architecture:** Modular SPA with routing, services, and component-based structure

## Getting Started

### Prerequisites

- Node.js and npm
- Ionic CLI: `npm install -g @ionic/cli`
- Firebase project with Authentication and Realtime Database enabled

### Installation

```bash
git clone https://github.com/MagdalenaB0707/Focusly.git
cd Focusly
npm install
```

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Email/Password Authentication**
3. Enable **Realtime Database**
4. Copy your Firebase config into `src/environments/environment.ts`

### Run Locally

```bash
ionic serve
```

## Project Structure

```
src/
├── app/
│   ├── components/       # Reusable UI components
│   ├── pages/            # App pages (login, register, dashboard, etc.)
│   ├── services/         # Firebase service layer
│   └── models/           # Data models (User, Activity, Course, Session, Goal)
├── environments/         # Firebase config
```
