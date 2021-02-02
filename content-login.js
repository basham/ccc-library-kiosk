chrome.storage.local.get({
  username: '',
  password: '',
  libraryName: ''
}, ({ username, password, libraryName }) => {
  if (!username || !password || !libraryName) {
    return
  }
  document.querySelector('input[name="lnname"]').value = username
  document.querySelector('input[name="lnpassword"]').value = password
  document.querySelector('input[name="lnlibraryname"]').value = libraryName
  const params = (new URL(document.location)).searchParams
  const command = params.get('command')
  const submitButton = command === 'checkout' ? 'Out Only' : 'In Only'
  document.querySelector(`input[value="${submitButton}"]`).click()
})
