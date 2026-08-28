import { ThemeProvider } from './contexts/ThemeContext';
import { BuilderPage } from './pages/Builder/BuilderPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BuilderPage />
    </ThemeProvider>
  );
}

export default App;
