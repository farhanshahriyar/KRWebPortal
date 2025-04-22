# 🏆 KingsRock eSports Webportal

**KingsRock Webportal** is a comprehensive web application designed to manage the core operational aspects of the **KingsRock eSports Platform**. This application empowers admins and users with real-time tools for **member management**, **tournament scheduling**, **leave requests**, **attendance tracking**, and **announcements**.

Built using modern front-end technologies like **React**, **TypeScript**, **TailwindCSS**, and powered by **Vite** for lightning-fast development workflows.

---

## 📌 Table of Contents

- [✨ Overview](#-overview)
- [📁 Directory Structure](#-directory-structure)
- [⚙️ Features](#️-features)
- [🚀 Installation](#-installation)
- [📦 Usage](#-usage)
- [🧪 Technologies Used](#-technologies-used)

---

## ✨ Overview

The KingsRock Webportal is crafted for both administrators and team members of KingsRock eSports to streamline daily operations. Whether you're updating rosters or tracking attendance, this portal provides a centralized solution through an intuitive and responsive UI.

### Core Functionalities:
- 🎯 **Admin Dashboard**: Manage members, assign roles, and monitor statistics.
- 📅 **Tournament Scheduling**: Plan, create, and display upcoming tournaments.
- 📝 **Leave Management**: Submit, review, and approve team member leave requests.
- 📊 **Attendance Tracking**: Automatically mark and visualize member attendance.
- 🔔 **Live Announcements**: Share real-time updates, logs, and alerts with the team.
- 🔐 **Role-Based Access Control (RBAC)**: Granular feature control based on user roles.

---

## 📁 Directory Structure

<details>
<summary>📂 Click to expand</summary>

```plaintext
farhanshahriyar-kingsrock-webportal/
│
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.*.json
│
├── public/
│   └── lovable-uploads/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── admin-dashboard/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── integrations/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│
└── supabase/
    ├── config.toml
    └── functions/
        └── mark-absent-users/
            └── index.ts
```
</details>

---

## ⚙️ Features

| Module                | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| 🧑‍💼 Member Management  | View, edit, and manage user roles and details.                              |
| 🏖 Leave Requests      | Submit and approve requests with status filters.                            |
| 🏆 Tournaments         | Schedule, edit, and list tournament events. [running]                                |
| 📈 Attendance          | Monitor member attendance with data visualizations.                         |
| 🔔 Notifications       | Push real-time updates and logs to users.                                   |
| 👮 Role-Based Access   | Secure features behind permission controls.                                 |
| ☁ Supabase Integration| Auth, storage, database, and edge functions powered by Supabase.            |

---

## 🚀 Installation

```bash
git clone https://github.com/farhanshahriyar/farhanshahriyar-kingsrock-webportal.git
cd farhanshahriyar-kingsrock-webportal
npm install
```

---

## 📦 Usage

### Start the development server:
```bash
npm run dev
```

Visit: `http://localhost:5173`

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

---

## 🧪 Technologies Used

| Stack           | Tools/Libraries                       |
|----------------|----------------------------------------|
| Frontend       | React, TypeScript, TailwindCSS         |
| UI Components  | ShadCN/UI, Recharts, HeroIcons         |
| State Mgmt     | Context API, Custom Hooks              |
| Backend/Auth   | Supabase                               |
| Deployment     | Netlify                                |


> *“Building the future of eSports management—one feature at a time.”*  
> — RoboCop | Founder of KingsRock eSports
```


