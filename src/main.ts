import './components-lit/graph-app';
import './index.css';
import './styles/tokens.css';

// Render full Lit app
const root = document.getElementById('root')!;
const app = document.createElement('graph-app');
root.appendChild(app);
