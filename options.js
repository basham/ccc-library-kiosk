document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({
    username: '',
    password: '',
    libraryName: '',
    externalBanner: true,
    fullscreen: true,
    timeout: true,
    showTimeout: 120,
    confirmTimeout: 30
  }, (options) => {
    const { username, password, libraryName } = options
    const { externalBanner, fullscreen, timeout, showTimeout, confirmTimeout } = options
    document.getElementById('username').value = username
    document.getElementById('password').value = password
    document.getElementById('libraryName').value = libraryName
    document.getElementById('externalBanner').checked = externalBanner
    document.getElementById('fullscreen').checked = fullscreen
    document.getElementById('timeout').checked = timeout
    document.getElementById('showTimeout').value = showTimeout
    document.getElementById('confirmTimeout').value = confirmTimeout
  })
})

document.getElementById('login').addEventListener('submit', (event) => {
  event.preventDefault()

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const libraryName = document.getElementById('libraryName').value
  const externalBanner = document.getElementById('externalBanner').checked
  const fullscreen = document.getElementById('fullscreen').checked
  const timeout = document.getElementById('timeout').checked
  const showTimeout = parseInt(document.getElementById('showTimeout').value)
  const confirmTimeout = parseInt(document.getElementById('confirmTimeout').value)

  chrome.storage.local.set({
    username,
    password,
    libraryName,
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
