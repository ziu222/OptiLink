import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutRenderer } from './components/layouts/LayoutRenderer';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LayoutRenderer />
    </ThemeProvider>
  );
}

export default App;
