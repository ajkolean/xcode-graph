import './components/xcode-graph';
import './styles/tokens.css';
import { xcodeGraphData } from '@/fixtures/xcode-graph-data';
import type { GraphApp } from './components/xcode-graph';

// Render full Lit app with demo fixture data
const root = document.getElementById('root');
if (root) {
  const app = document.createElement('xcode-graph') as GraphApp;
  app.nodes = xcodeGraphData.nodes;
  app.edges = xcodeGraphData.edges;
  root.appendChild(app);
}
