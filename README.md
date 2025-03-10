# Thesis_Viewer
## `Project Structure`
## `src/`
This directory contains all of the source code.

- ### `components/`
    - Reusable UI Elements
    - Example: buttons, forms, etc.
    
- ### `context/`
    - Where the shared state are passed through the components using React Context
    - Example: AuthContext, PermissionsContext, etc.
      
- ### `lib/`
    - Api functions
    - Examples: Supabase and Hugging face interactions.

- ### `pages/`
    - Indivudual pages for the app.
    - Example: AdminDashboard, UserDashboard, Login, etc.

- ### `routes/`
    - Routes for the app where pages are rendered
    - Examples:  AppRoutes and ProtectedRoutes.

- ### `styles/`
    - All CSS styling

- ### `App.tsx/`
    - Where

- ### `index.tsx/`
    - Entry point of the app. This is where react renders the app.

## `public/`
- contains static assets like HTML, images, and fonts.

## `package.json/`
- Describes the project, its dependencies, and scripts to run app.

## `tsconfig.json/`
- Configures the TypeScript compiler, defining rules for how the TypeScript files are handled.

## `.gitignore/`
- Specifies files or directories excluded from Git Version Control e.g. node_modules, env, etc.
