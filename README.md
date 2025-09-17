# 🎓 Thesis Viewer

A web application for a centralized thesis repository built for viewing and managing academic theses documents.

Built with [React](https://reactjs.org/), [Supabase](https://supabase.com/), and [Node.js](https://nodejs.org/).

## 📌 Key Features
- 🔍 Search and browse thesis documents
- 📄 View theses with a PDF viewer
- 📚 Bookmark, track views, and analyze reading behavior
- 🧠 AI-powered Q&A chatbot for thesis content
- 🔐 User authentication and role-based and permission-based features
- 📊 Analytics page for admins
- ⚙️ User Management for Admins and Superadmins to manage user permissions to system features

## 🏗️ Tech Stack
- **Frontend**: React, TypeScript
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

### Steps to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/yourusername/thesis-viewer-app.git
cd thesis-viewer-app
```

2. Install Dependencies:
```bash
npm install
```

3. Set Up Environment Variables\
**Create a .env file in the root directory and add:**
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the application locally:
```
npm start
```

## 🌟 Usage
- Viewing PDFs: Browse and view thesis documents via the PDF viewer. You can zoom, scroll, and navigate between pages.
- Bookmarking: Click the bookmark icon on any thesis document to save it to your list.
- Thesis Management: Librarians, Admins, and Superadmins can add and manage thesis documents in the system.
- User Management: Admins and Superadmins can edit user permissions
- Analytics: Admins can track document interactions, view counts, and time spent reading.

## 📝 License
This project is licensed under the MIT License.

## 👥 Developers
**Jaime Dy III**\
Role: Lead Developer & Scrum Master\
[Github](https://github.com/JaimeDyIII)

**Leo Gabriel Rentazida**\
Role: Full-Stack Developer\
[Github](https://github.com/Doc-Leo)

**Alyssa San Pedro**\
Role: Full-Stack Developer\
[Github](https://github.com/AlyssaMaeSanPedro)

**Vina Marie Solitario**\
Role: UI/UX Designer & Frontend Developer\
[Github](https://github.com/VinaSolitario)

**Dondon Catan**\
Role: Tester\
[Github](https://github.com/Lyndoncatan)
