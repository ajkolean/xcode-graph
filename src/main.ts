import './components/graph-app';
import './index.css';
import './styles/tokens.css';
import { tuistGraphData } from '@/fixtures/tuist-graph-data';
import type { GraphApp } from './components/graph-app';

// Render full Lit app with demo fixture data
const root = document.getElementById('root')!;
const app = document.createElement('graph-app') as GraphApp;
app.nodes = tuistGraphData.nodes;
app.edges = tuistGraphData.edges;
root.appendChild(app);
