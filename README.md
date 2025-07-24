# Sublite 🎬🔐

**Sublite** is a MERN stack-based web application that acts as a **secure and trusted mediator** for users who want to **rent premium OTT or app accounts** from other verified users. Whether you're a content lover or a subscriber with unused screens, **Sublite connects clients and sharers safely.**

---

## 🌟 Features

- 🔒 **JWT-based Authentication** – Fully secured login/signup system
- 👥 **User Roles** – Clients (renters) & Sharers (owners)
- 🎫 **Rent OTT/App Accounts** – Share or access subscriptions like Netflix, Prime, etc.
- 💬 **Request/Approval Flow** – Clients send requests, Sharers approve
- 📆 **Duration-Based Rent** – Rent accounts for specific time periods
- 📱 **Responsive UI** – Works across all devices
- ⚡ **MERN Stack** – Full-stack production-grade app

---

## 🛠 Tech Stack

| Layer       | Technology             |
|-------------|------------------------|
| Frontend    | React.js, Tailwind CSS |
| Backend     | Node.js, Express.js    |
| Database    | MongoDB + Mongoose     |
| Auth        | JWT (JSON Web Tokens)  |
| State Mgmt  | Context API            |
| Deployment  | Render / Vercel        |


📁 Folder Structure

sublite/
├── client/ # React Frontend
│ ├── public/
│ └── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page-level components (Routes)
│ ├── context/ # Global State (like Auth context)
│ └── App.jsx # Root component
│
├── server/ # Node.js + Express Backend
│ ├── controllers/ # Request handlers / logic
│ ├── models/ # Mongoose schemas & models
│ ├── routes/ # API routes
│ ├── middlewares/ # Custom middleware (auth, error, etc.)
│ └── server.js # Entry point for backend

