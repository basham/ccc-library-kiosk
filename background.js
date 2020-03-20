chrome.runtime.onMessage.addListener((message) => {
  if (message === 'timeout') {
    chrome.tabs.query({}, (tabs) => {
      const ids = tabs.map(({ id }) => id)
      chrome.tabs.remove(ids)
    })
    chrome.tabs.create({ index: 0 })
  }
})
