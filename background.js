chrome.runtime.onMessage.addListener((message) => {
  if (message === 'timeout') {
    chrome.tabs.query({}, (tabs) => {
      const ids = tabs.map(({ id }) => id)
      chrome.tabs.remove(ids)
    })
    chrome.tabs.create({ index: 0 })
    chrome.windows.getCurrent(maximize)
  }
})

chrome.tabs.onUpdated.addListener(resetTimeouts)
chrome.tabs.onActivated.addListener(resetTimeouts)
chrome.windows.onCreated.addListener(maximize)

function resetTimeouts () {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(({ id, active }) => {
      chrome.tabs.sendMessage(id, active ? 'startTimeout' : 'stopTimeout')
    })
  })
}

function maximize (window) {
  const { id } = window
  chrome.windows.update(id, { state: 'maximized' })
  chrome.storage.local.get('maximize', ({ maximize }) => {
    if (maximize) {
      chrome.windows.update(id, { state: 'maximized' })
    }
  })
}
