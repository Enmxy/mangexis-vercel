// Image Protection - Prevent right-click, drag, and copy
// Note: DevTools are allowed, only protecting against casual copying

// Disable right-click context menu
export const disableContextMenu = (element) => {
  if (!element) return
  
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    showProtectionMessage('Sağ tık devre dışı')
    return false
  }, { capture: true })
}

// Disable image dragging
export const disableDragStart = (element) => {
  if (!element) return
  
  element.addEventListener('dragstart', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, { capture: true })
  
  element.style.userSelect = 'none'
  element.style.webkitUserSelect = 'none'
  element.style.mozUserSelect = 'none'
  element.style.msUserSelect = 'none'
  element.draggable = false
}

// Disable only copy/save shortcuts (allow DevTools)
export const disableShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Only block Ctrl+S (save) and Ctrl+U (view source)
    if (
      (e.ctrlKey && (e.key === 'S' || e.key === 's')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault()
      e.stopPropagation()
      showProtectionMessage('Kaydetme devre dışı')
      return false
    }
  }, { capture: true })
}

// DevTools detection removed - developers can use browser tools freely

// Show protection message
const showProtectionMessage = (message) => {
  const existing = document.getElementById('protection-toast')
  if (existing) existing.remove()
  
  const toast = document.createElement('div')
  toast.id = 'protection-toast'
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(239, 68, 68, 0.95);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999998;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  `
  
  toast.textContent = `🔒 ${message}`
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// Add CSS animations
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`
document.head.appendChild(style)

// Initialize protection
export const initImageProtection = () => {
  disableShortcuts()
  
  // Disable print
  window.addEventListener('beforeprint', (e) => {
    e.preventDefault()
    showProtectionMessage('Yazdırma devre dışı')
    return false
  })
}

// Apply protection to specific image
export const protectImage = (imageElement) => {
  if (!imageElement) return
  
  disableContextMenu(imageElement)
  disableDragStart(imageElement)
  
  // Add CSS protection
  imageElement.style.pointerEvents = 'none'
  imageElement.style.userSelect = 'none'
  imageElement.style.webkitUserSelect = 'none'
  imageElement.style.mozUserSelect = 'none'
  imageElement.style.msUserSelect = 'none'
  
  // Prevent selection via CSS
  imageElement.setAttribute('unselectable', 'on')
  imageElement.setAttribute('onselectstart', 'return false')
  imageElement.setAttribute('onmousedown', 'return false')
  
  // Add class for styling
  imageElement.classList.add('reader-image')
}
