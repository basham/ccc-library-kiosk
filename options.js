document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({
    username: '',
    password: '',
    libraryName: ''
  }, ({ username, password, libraryName }) => {
    document.getElementById('username').value = username
    document.getElementById('password').value = password
    document.getElementById('libraryName').value = libraryName
  })
})

document.getElementById('login').addEventListener('submit', (event) => {
  event.preventDefault()

  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const libraryName = document.getElementById('libraryName').value

  chrome.storage.sync.set({
    username,
    password,
    libraryName
  }, () => {
    const status = document.getElementById('status');
    status.textContent = '✔ Options saved';
    setTimeout(() => {
      status.textContent = ''
    }, 5000)
  })
})
