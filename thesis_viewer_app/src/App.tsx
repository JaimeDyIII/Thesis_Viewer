import './styles/App.css';
import AppRoutes from './routes/AppRoutes';
import { ThesisProvider } from "./context/ThesisContext";

function App() {
  return (
    <ThesisProvider>
      <AppRoutes />
    </ThesisProvider>
  );
}

export default App;
