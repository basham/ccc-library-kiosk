let showTimeout = 0
let confirmTimeout = 0
let started = false
let lastActivity = null
let timeoutNotice = null
let lastFocus = null
let lastBodyOverflow = null
let timer = null

const messageResponses = {
  startTimeout,
  stopTimeout
}

chrome.runtime.onMessage.addListener((message) => {
  const fn = messageResponses[message]
  if (fn) {
    chrome.storage.local.get(['timeout', 'showTimeout', 'confirmTimeout'], (options) => {
      const { timeout } = options
      if (timeout) {
        showTimeout = options.showTimeout * 1000
        confirmTimeout = options.confirmTimeout * 1000
        fn()
      }
      else {
        stopTimeout()
      }
    })
  }
})

function startTimeout () {
  if (started) {
    return
  }
  timeoutNotice = document.createElement('div')
  lastFocus = document.activeElement
  lastBodyOverflow = document.body.style.overflow
  renderTimoutNotice()
  markActivity()
  document.addEventListener('mousemove', markActivity)
  document.addEventListener('click', markActivity)
  document.addEventListener('keyup', markActivity)
  timer = setInterval(checkTimer, 1000)
  started = true
}

function stopTimeout () {
  if (!started) {
    return
  }
  document.removeEventListener('mousemove', markActivity)
  document.removeEventListener('click', markActivity)
  document.removeEventListener('keyup', markActivity)
  clearInterval(timer)
  reset()
  timeoutNotice.remove()
  started = false
}

function checkTimer () {
  const lastActivityDiff = new Date() - lastActivity
  const totalTimeout = showTimeout + confirmTimeout
  const count = Math.ceil((totalTimeout - lastActivityDiff) / 1000)
  const countdown = count === 1 ? '1 second' : `${count < 0 ? 0 : count} seconds`
  timeoutNotice.querySelector('[role="status"]').innerHTML = `Resetting kiosk in ${countdown}&hellip;`

  if (lastActivityDiff >= showTimeout && timeoutNotice.hasAttribute('hidden')) {
    lastFocus = document.activeElement
    lastBodyOverflow = document.body.style.overflow
    timeoutNotice.removeAttribute('hidden')
    timeoutNotice.focus()
    document.body.style.overflow = 'hidden'
  }

  if (lastActivityDiff >= totalTimeout) {
    chrome.runtime.sendMessage('timeout')
  }
}

function markActivity () {
  lastActivity = new Date()
  reset()
}

function reset () {
  if (timeoutNotice.hasAttribute('hidden')) {
    return
  }
  lastFocus.focus()
  timeoutNotice.setAttribute('hidden', 'true')
  document.body.style.overflow = lastBodyOverflow
}

function renderTimoutNotice () {
  timeoutNotice.setAttribute('tabindex', '0')
  timeoutNotice.classList.add('ccclib-timeout-notice')
  timeoutNotice.innerHTML = `
    <style>
      .ccclib-timeout-notice {
        background-color: rgba(0, 0, 0, 80%);
        color: #333333;
        font-family: system-ui, sans-serif;
        font-size: 100%;
        height: 100vh;
        left: 0;
        position: fixed;
        top: 0;
        width: 100vw;
        z-index: 1000;
      }
      .ccclib-timeout-notice:focus {
        outline: none;
      }
      .ccclib-timeout-notice__body {
        background-color: #ffffff;
        border-radius: 0.5rem;
        margin: 10vh auto 0;
        max-width: max-content;
        padding: 2rem;
      }
      .ccclib-timeout-notice h2 {
        font-size: 1.5rem;
        line-height: 2rem;
        margin: 0 0 0.5rem;
      }
      .ccclib-timeout-notice p {
        font-size: 1rem;
        line-height: 1.5rem;
        margin: 0;
      }
    </style>
    <div class="ccclib-timeout-notice__body">
      <h2>Press any key to continue</h2>
      <p role="status"></p>
    </div>
  `
  document.body.append(timeoutNotice)
}
