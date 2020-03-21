chrome.runtime.onMessage.addListener((message) => {
  if (message === 'timeout') {
    chrome.tabs.query({}, (tabs) => {
      const ids = tabs.map(({ id }) => id)
      chrome.tabs.remove(ids)
    })
    chrome.tabs.create({ index: 0 })
  }
})

chrome.tabs.onUpdated.addListener(resetTimeouts)
chrome.tabs.onActivated.addListener(resetTimeouts)

function resetTimeouts () {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(({ id, active }) => {
      chrome.tabs.sendMessage(id, active ? 'startTimeout' : 'stopTimeout')
    })
  })
}

chrome.windows.onCreated.addListener(({ id }) => {
  chrome.windows.update(id, { state: 'fullscreen' })
})
