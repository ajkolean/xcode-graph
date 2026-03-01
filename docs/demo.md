---
layout: page
---

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  await import('../src/styles/tokens.css')
  await import('../src/components/xcode-graph')

  const container = document.getElementById('xcode-graph-demo')
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

<style scoped>
:deep(.VPDoc .container) {
  max-width: 100% !important;
}
:deep(.vp-doc) {
  padding: 0 !important;
}
:deep(.VPDoc .content) {
  padding: 0 !important;
}
:deep(.VPDoc .content-container) {
  max-width: 100% !important;
}
</style>

<div id="xcode-graph-demo" style="width: 100%; height: calc(100vh - 64px); overflow: hidden;"></div>
