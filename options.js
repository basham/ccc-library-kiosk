document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({
    externalBanner: true,
    fullscreen: true,
    timeout: true,
    showTimeout: 120,
    confirmTimeout: 30
  }, (options) => {
    const { externalBanner, fullscreen, timeout, showTimeout, confirmTimeout } = options
    document.getElementById('externalBanner').checked = externalBanner
    document.getElementById('fullscreen').checked = fullscreen
    document.getElementById('timeout').checked = timeout
    document.getElementById('showTimeout').value = showTimeout
    document.getElementById('confirmTimeout').value = confirmTimeout
  })
})

document.getElementById('login').addEventListener('submit', (event) => {
  event.preventDefault()

  const externalBanner = document.getElementById('externalBanner').checked
  const fullscreen = document.getElementById('fullscreen').checked
  const timeout = document.getElementById('timeout').checked
  const showTimeout = parseInt(document.getElementById('showTimeout').value)
  const confirmTimeout = parseInt(document.getElementById('confirmTimeout').value)

  chrome.storage.local.set({
    externalBanner,
    fullscreen,
    timeout,
    showTimeout,
    confirmTimeout
  }, () => {
    const alert = document.getElementById('success-alert')
    alert.removeAttribute('hidden')
    alert.focus()
  })
})
