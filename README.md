# 🎓 Thesis Viewer

A web application for a centralized thesis repository built for viewing and managing academic theses documents.

Built with [React](https://reactjs.org/), [Supabase](https://supabase.com/), and [Node.js](https://nodejs.org/).

## 📌 Features

- 🔍 Search and browse thesis documents
- 📄 View theses with a PDF viewer
- 📚 Bookmark, track views, and analyze reading behavior
- 🧠 AI-powered Q&A chatbot for thesis content (optional)
- 🔐 User authentication and role-based access
- 📊 Analytics dashboard for admins

## 🏗️ Tech Stack
- **Frontend**: React, TailwindCSS, TypeScript, @react-pdf-viewer
- **Backend**: Supabase (Database + Auth + Storage)
- **AI Integration**: OpenRouter API

## 🗂️ `Project Structure`
```
thesis_viewer_app/
├── public/                   # Static public assets (favicon, index.html, etc.)
├── src/                      # Main source code
│   ├── api/                  # API request functions (e.g. Supabase, OpenAI)
│   ├── components/           # Custom Reusable UI components
│   ├── context/              # React Context providers (e.g. auth, permissions)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── pages/                # Route-specific page components
│   ├── routes/               # Route definitions
│   ├── services/             # Supabase or API integration services
│   ├── styles/               # CSS styling files
│   ├── App.tsx               # Main React App component
│   ├── index.css             # Global styles
│   ├── index.tsx             # App entry point
│   └── theme.ts              # Theme configuration (e.g. MUI, Tailwind tokens)
├── .gitignore                # Git ignored files
├── package-lock.json         # NPM dependency lock
├── package.json              # Project metadata and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```