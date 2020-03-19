chrome.storage.sync.get({
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
  document.querySelector('input[value="In and Out"]').click()
})
