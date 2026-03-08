import './components/xcode-graph';
import './styles/tokens.css';
import type { GraphApp } from './components/xcode-graph';

// Render full Lit app with demo fixture data
const root = document.getElementById('root');
if (root) {
  const app = document.createElement('xcode-graph') as GraphApp;
  root.appendChild(app);
  const { rawXcodeGraph } = await import('@/fixtures/xcode-graph-data');
  app.loadRawGraph(rawXcodeGraph);
}
