---
layout: page
---

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  await import('../src/styles/tokens.css')
  await import('../src/components/graph-app')

  const container = document.getElementById('graph-demo')
  if (!container) return

  const app = document.createElement('xcode-graph')
  app.setAttribute('show-upload', '')
  app.style.width = '100%'
  app.style.height = '100%'
  container.appendChild(app)

  try {
    const res = await fetch(new URL('/xcode-graph/example-graph.json', window.location.origin))
    const raw = await res.json()
    app.loadRawGraph(raw)
  } catch (e) {
    console.warn('Could not load example graph:', e)
  }
})
</script>

# Demo

Try the `<xcode-graph>` component live. The example below loads a real Tuist dependency graph. Use the **Load graph JSON** button in the bottom-left corner to load your own `tuist graph --format json` output.

<div id="graph-demo" style="width: 100%; height: calc(100vh - 200px); min-height: 500px; border: 1px solid var(--vp-c-border); border-radius: 8px; overflow: hidden;"></div>
