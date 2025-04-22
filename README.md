# KingsRock eSports Webportal

This project is a web application for managing various aspects of the Kingsrock platform, including member management, leave requests, tournament scheduling, and attendance tracking. The application is built using **React**, **TypeScript**, and **TailwindCSS** for styling. **Vite** is used as the build tool to enable a fast development experience.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Overview

The Kingsrock Webportal provides an interactive dashboard and various management features for administrators and users. Key features include:

- **Admin Dashboard**: View member lists, edit member details, and manage role-based features.
- **Leave Requests**: Submit, view, and manage leave requests.
- **Tournament Scheduling**: Create and manage tournaments.[running]
- **Attendance Tracking**: View and track attendance for different members.
- **Notifications & Updates**: View announcements and updates in real-time.
  
The application uses modern libraries and tools to provide a seamless and responsive user experience.

## Directory Structure

Here’s the structure of the project:

```markdown
farhanshahriyar-kingsrock-webportal/
│
├── README.md                     # Project documentation file
├── components.json                # JSON file containing component metadata
├── eslint.config.js               # ESLint configuration file
├── index.html                     # HTML template for the project
├── package.json                   # Project dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── tsconfig.app.json              # TypeScript config for the app
├── tsconfig.json                  # Base TypeScript configuration
├── tsconfig.node.json             # TypeScript configuration for Node.js
├── vite.config.ts                 # Vite configuration file
│
├── public/                        # Public assets like redirects and uploads
│   ├── _redirects                 # Redirects for Netlify or other static hosts
│   └── lovable-uploads/           # Folder for file uploads
│
└── src/                           # Source code for the application
    ├── App.css                    # Global styles
    ├── App.tsx                    # Main app component
    ├── DashboardHeader.tsx         # Header for the admin dashboard
    ├── index.css                  # Base CSS for the application
    ├── main.tsx                   # Entry point for the app
    ├── vite-env.d.ts              # Vite environment declarations
    ├── admin-dashboard/            # Admin dashboard components
    │   ├── AdminDashboard.tsx      # Admin dashboard component
    │   ├── EditMemberDialog.tsx    # Dialog to edit member information
    │   └── MemberList.tsx          # List of members
    ├── components/                 # Reusable components
    │   ├── DashboardHeader.tsx     # Dashboard header
    │   ├── DashboardSidebar.tsx    # Sidebar for navigation
    │   ├── ProtectedComponent.tsx  # Protected component for authorization
    │   ├── dashboard/              # Components related to the dashboard
    │   │   ├── AttendanceChart.tsx # Attendance chart component
    │   │   ├── RecentUpdates.tsx   # Displays recent updates
    │   │   └── StatCards.tsx       # Stat cards for dashboard metrics
    │   ├── leave-request/          # Leave request components
    │   │   ├── LeaveRequestForm.tsx
    │   │   └── LeaveRequestList.tsx
    │   ├── noc/                    # No-Objection Certificate components
    │   │   ├── NOCForm.tsx
    │   │   ├── NOCList.tsx
    │   │   └── NOCStatus.tsx
    │   ├── schedule/               # Schedule management components
    │   │   ├── RequestScheduleTable.tsx
    │   │   ├── ScheduleForm.tsx
    │   │   └── ScheduleTable.tsx
    │   ├── sidebar/                # Sidebar navigation components
    │   │   ├── RoleFeaturesDropdown.tsx
    │   │   └── SidebarNavigation.tsx
    │   ├── tournaments/            # Tournament components
    │   │   ├── TournamentForm.tsx
    │   │   └── TournamentTable.tsx
    │   └── ui/                     # UI components (buttons, cards, etc.)
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── icons.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── loading-indicator.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── notifications.tsx
    │       ├── page-header.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── use-toast.ts
    ├── contexts/                   # Contexts for app-wide state management
    │   └── RoleContext.tsx
    ├── hooks/                      # Custom hooks
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── integrations/               # External integrations like Supabase
    │   └── supabase/
    │       ├── client.ts
    │       └── types.ts
    ├── lib/                        # Utility functions
    │   └── utils.ts
    ├── pages/                      # Main pages for the app
    │   ├── AddUpdateLogs.tsx
    │   ├── Announcement.tsx
    │   ├── Attendance.tsx
    │   ├── Auth.tsx
    │   ├── Index.tsx
    │   ├── LeaveRequest.tsx
    │   ├── ManageMembers.tsx
    │   ├── Members.tsx
    │   ├── NOC.tsx
    │   ├── Profile.tsx
    │   ├── RequestSchedule.tsx
    │   ├── Schedule.tsx
    │   ├── Settings.tsx
    │   ├── TournamentsMatches.tsx
    │   └── UpdateLogs.tsx
    └── utils/                      # Utility functions for date and time
        └── dateUtils.ts
└── supabase/                      # Supabase configuration and server functions
    ├── config.toml
    └── functions/
        └── mark-absent-users/
            └── index.ts
```

## ⚙️ Features
Module | Description
🧑‍💼 Member Management | View, edit, and manage user roles and details.
🏖 Leave Requests | Submit and approve requests with status filters.
🏆 Tournaments | Schedule, edit, and list tournament events.
📈 Attendance | Monitor member attendance with data visualizations.
🔔 Notifications | Push real-time updates and logs to users.
👮 Role-Based Access | Secure features behind permission controls.
☁ Supabase Integration | Auth, storage, database, and edge functions powered by Supabase.

## Installation

To get started with this project locally:

1. Clone the repository:

```bash
git clone https://github.com/your-username/farhanshahriyar-kingsrock-webportal.git
```

2. Navigate into the project directory:

```bash
cd farhanshahriyar-kingsrock-webportal
```

3. Install the dependencies:

```bash
npm install
```

## Usage

After the dependencies are installed, you can run the project in development mode using:

```bash
npm run dev
```

This will start a local development server and you can view the app by opening `http://localhost:****` in your browser.


## 🧪 Technologies Used
Stack | Tools/Libraries
Frontend | React, TypeScript, TailwindCSS
UI Components | ShadCN/UI, Recharts, HeroIcons
State Mgmt | Context API, Custom Hooks
Backend/Auth | Supabase 
Deployment | Netlify 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```
