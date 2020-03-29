const url = '/cgi-bin/selfservice.pl'
const errorSelector = 'font[color="#ff0000"]'
const successSelector = 'font[color="#347c17"]'

init()

function init () {
  // Remove provided styling
  document.querySelectorAll('link').forEach((el) => {
    el.remove()
  })

  const iconLink = document.createElement('link')
  iconLink.href = chrome.runtime.getURL('icon128.png')
  iconLink.rel = 'icon'
  iconLink.type = 'image/png'
  document.head.appendChild(iconLink)

  const params = (new URL(document.location)).searchParams
  const command = params.get('command')
  const term = params.get('term')
  const renew = params.get('renew')
  const goodpatron = params.get('goodpatron')
  const props = { command, term, renew }

  if (isScanCardPage()) {
    return renderScanCard(props)
  }

  // Renew
  if (command === 'checkin' && goodpatron) {
    const error = document.querySelector(errorSelector)
    const next = error ? 'error' : 'success'
    window.location.replace(`${url}?term=${term}&goodpatron=${goodpatron}&command=checkout&renew=${next}`)
    return
  }

  if (command === 'checkin') {
    return renderCheckIn(props)
  }

  if (command === 'checkout') {
    return renderPatron(props)
  }
}

function isScanCardPage () {
  try {
    return document.querySelector('form').childNodes[0].textContent.trim() === 'Enter Patron Number:'
  } catch {
    return false
  }
}

function render ({ title, content, hasError = false, alertMessage = '' }) {
  const name = 'ECC Library'

  document.title = `${hasError ? 'Error: ' : ''}${title} - ${name}`

  const container = document.createElement('div')
  container.innerHTML = `
    <header>
      <a href="${chrome.runtime.getURL('blank.html')}" class="logo">
        <img src="${chrome.runtime.getURL('ecc-logo-white.png')}" alt="${name}" />
        <span>Library</span>
      </a>
    </header>
    <main>
      ${renderAlert(alertMessage)}
      <h1>${title}</h1>
      ${content}
    </main>
  `
  document.body.appendChild(container)
}

function renderScanCard () {
  const error = document.querySelector(errorSelector)
  const errorMessage = error ? error.textContent.toLowerCase() : ''
  const isInvalid = errorMessage.includes('patron verification')
  const hasError = isInvalid

  const alertMessage = [
    isInvalid ? '😱 Library card number not found' : ''
  ]
    .filter((message) => message.length)[0] || ''

  const title = 'Scan your library card'
  const content = `
    <form method="GET" action="${url}" autocomplete="off">
      <div>
        <label for="library-card-number">
          Library card number
          <small>2000XXXX</small>
        </label>
        <input type="text" name="term" id="library-card-number" pattern="2\\d{7}" maxlength="8" />
      </div>
      <button type="submit">Continue</button>
      <input type="hidden" name="goodpatron" value="">
      <input type="hidden" name="command" value="checkout">
    </form>
    <hr />
    <h2>
      <span class="icon" aria-hidden="true">🗃</span>
      Find your card
    </h2>
    <ol>
      <li>Cards are sorted alphabetically by last name in the filing box</li>
      <li>Scan the barcode on your card to continue</li>
      <li>Return the card to the filing box</li>
    </ol>
    <h2>
      <span class="icon" aria-hidden="true">🔫</span>
      Scanner not working?
    </h2>
    <ol>
      <li>Confirm the <a href="#library-card-number">library card number field</a> is in focus before scanning</li>
      <li>Position the scanner 6 to 12 inches away from the barcode</li>
      <li>The scanner will emit a green light when it detects a barcode</li>
    </ol>
    <h2>
      <span class="icon" aria-hidden="true">👻</span>
      Cannot find your card?
    </h2>
    <ol>
      <li>Write down a note informing the librarian of the missing card</li>
      <li>Find your card number in the patron booklet</li>
      <li>Enter the number in the <a href="#library-card-number">library card number field</a></li>
    </ol>
    <h2>
      <span class="icon" aria-hidden="true">🖊️</span>
      Need to sign up for a card?
    </h2>
    <p>Fill out either the online <a href="https://docs.google.com/forms/d/e/1FAIpQLSdoM9GqJE4YglUEOQdWIfeLyvxV6oOt8DuQ9fgOHOXT8zcsGw/viewform">Library Card Signup Form</a> or the paper form.</p>
    <p>Expect the card to be printed and placed in the filing box within a week. If you want to check out items today, ask a <b>library helper</b> for assistance. If no one is available, write down:</p>
    <ol>
      <li>Your name, email, and phone number</li>
      <li>Current date</li>
      <li>Titles and barcode numbers (located in the upper left back corner, in the format of <b>3000XXXX</b>) of any items you are borrowing</li>
    </ol>
  `
  render({ title, content, hasError, alertMessage })
  document.getElementById('library-card-number').focus()
}

function renderPatron (props) {
  const error = document.querySelector(errorSelector)
  const errorMessage = error ? error.textContent.toLowerCase() : ''
  const isInvalid = errorMessage.includes('invalid')
  const isNotAvailable = errorMessage.includes('not available')
  const didNotRenew = props.renew === 'error'
  const hasError = isInvalid || isNotAvailable || didNotRenew

  const success = document.querySelector(successSelector)
  const successMessage = success ? success.textContent.toLowerCase() : ''
  const isCheckedOut = successMessage.includes('checked out')
  const didRenew = props.renew === 'success'

  const alertMessage = [
    didNotRenew ? '😱 Item could not be renewed' : '',
    isInvalid ? '😱 Item not found' : '',
    isNotAvailable ? '🤔 Item already checked out' : '',
    didRenew ? '✅ Item successfully renewed' : '',
    isCheckedOut ? '✅ Item successfully checked out' : ''
  ]
    .filter((message) => message.length)[0] || ''

  const goodpatron = document.querySelector('input[name="goodpatron"]').value

  const patronData = document.querySelector('td[width="400"]').childNodes
  const libraryCardNumber = patronData[1].textContent.trim()
  const [ lastName = '', firstName = '' ] = patronData[13].textContent.trim().split(', ')
  const name = `${firstName} ${lastName}`
  const email = patronData[15].textContent.trim()

  const today = getToday()
  const checkouts = [ ...document.getElementById('checkout_table').querySelectorAll('tr') ]
    .filter((row, index) => index > 0)
    .map((row) => {
      const [ status, barcode, titleRaw, callNumber, outDateRaw, dueDateRaw ] = [ ...row.childNodes ]
        .map((el) => el.textContent.trim())
        const title = displayTitle(titleRaw)
      const outDate = displayDate(outDateRaw)
      const dueDate = displayDate(dueDateRaw)
      const isOverdue = dueDateRaw < today
      const canRenew = outDateRaw < today
      return { barcode, title, callNumber, outDate, dueDate, isOverdue, canRenew, goodpatron }
    })

  const title = 'Check out'
  const content = `
    <form method="GET" action="${url}" autocomplete="off">
      ${renderBookBarcodeField()}
      <button type="submit">Check out</button>
      <input type="hidden" name="goodpatron" value="${goodpatron}" />
      <input type="hidden" name="command" value="checkout" />
    </form>
    <hr />
    <h2>
      <span class="icon" aria-hidden="true">🧑</span>
      ${name}
    </h2>
    <dl>
      <div>
        <dt>Email</dt>
        <dd>${email}</dd>
      </div>
      <div>
        <dt>Library card number</dt>
        <dd>${libraryCardNumber}</dd>
      </div>
    </dl>
    <p>
      <a href="${chrome.runtime.getURL('blank.html')}">Log out</a>
    </p>
    <h2>
      <span class="icon" aria-hidden="true">📚</span>
      Checkouts
    </h2>
    <div class="book-list">
      ${renderCheckouts(checkouts)}
    </div>
  `
  render({ title, content, hasError, alertMessage })

  document.getElementById('item-number').focus()

  const barcodes = checkouts.map(({ barcode }) => barcode)
  renderCovers(barcodes)
}

function renderCheckouts (checkouts) {
  if (!checkouts.length) {
    return `<p>No checkouts</p>`
  }
  return checkouts.map(renderCheckout).join('')
}

function renderCheckout (checkout) {
  const { title, outDate, dueDate, barcode, isOverdue } = checkout
  return `
    <div>
      <h3>${title}</h3>
      <dl>
        <div>
          <dt>Out date</dt>
          <dd>${outDate}</dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>${dueDate}</dd>
          ${isOverdue ? '<dd class="highlight">⌛ Overdue!</dd>' : ''}
        </div>
        <div>
          <dt>Barcode</dt>
          <dd>${barcode}</dd>
        </div>
      </dl>
      ${renderRenewButton(checkout)}
    </div>
    <div class="book-cover" data-barcode=${barcode}></div>
  `
}

function renderRenewButton (checkout) {
  const { canRenew, barcode, goodpatron } = checkout
  if (!canRenew) {
    return ''
  }
  return `
    <div>
      <a href="${url}?term=${barcode}&goodpatron=${goodpatron}&command=checkin" class="button">Renew</a>
    </div>
  `
}

function renderCheckIn () {
  const error = document.querySelector(errorSelector)
  const errorMessage = error ? error.textContent.toLowerCase() : ''
  const isInvalid = errorMessage.includes('invalid')
  const isNotCheckedOut = errorMessage.includes('not checked out')
  const hasError = isInvalid || isNotCheckedOut

  const success = document.querySelector(successSelector)
  const successMessage = success ? success.textContent.toLowerCase() : ''
  const isCheckedIn = successMessage.includes('checked in')

  const alertMessage = [
    isInvalid ? '😱 Item not found' : '',
    isNotCheckedOut ? '🤔 Item already checked in' : '',
    isCheckedIn ? '✅ Item successfully checked in' : ''
  ]
    .filter((message) => message.length)[0] || ''

  const today = getToday()
  const checkins = [ ...document.querySelectorAll('form ~ table tr') ]
    .filter((row, index) => index > 0)
    .map((row) => {
      const [ barcode, titleRaw, outDateRaw, dueDateRaw, libaryCardNumber, patronName, type, code ] = [ ...row.childNodes ]
        .map((el) => el.textContent.trim())
      const title = displayTitle(titleRaw)
      const outDate = displayDate(outDateRaw)
      const dueDate = displayDate(dueDateRaw)
      const inDate = displayDate(today)
      const isOverdue = dueDateRaw < today
      return { barcode, title, outDate, dueDate, inDate, isOverdue, libaryCardNumber, patronName, type, code }
    })

  const title = 'Check in'
  const content = `
    <form method="GET" action="${url}" autocomplete="off">
      ${renderBookBarcodeField()}
      <button type="submit">Check in</button>
      <input type="hidden" name="command" value="checkin" />
    </form>
    ${renderCheckins(checkins)}
  `
  render({ title, content, hasError, alertMessage })

  document.getElementById('item-number').focus()

  const barcodes = checkins.map(({ barcode }) => barcode)
  renderCovers(barcodes)
}

function renderCheckins (checkins) {
  if (!checkins.length) {
    return ''
  }
  return `
    <hr />
    <h2>
      <span class="icon" aria-hidden="true">📚</span>
      Checkins
    </h2>
    <div class="book-list">
      ${checkins.map(renderCheckin).join('')}
    </div>
  `
}

function renderCheckin (checkin) {
  const { barcode, title, outDate, inDate, isOverdue, libaryCardNumber, patronName } = checkin
  return `
    <div>
      <h3>${title}</h3>
      <dl>
        <div>
          <dt>Patron</dt>
          <dd>${patronName}</dd>
          <dd>${libaryCardNumber}</dd>
        </div>
        <div>
          <dt>Out date</dt>
          <dd>${outDate}</dd>
        </div>
        <div>
          <dt>In date</dt>
          <dd>${inDate}</dd>
          ${isOverdue ? '<dd class="highlight">⌛ Overdue!</dd>' : ''}
        </div>
        <div>
          <dt>Barcode</dt>
          <dd>${barcode}</dd>
        </div>
      </dl>
    </div>
    <div class="book-cover" data-barcode=${barcode}></div>
  `
}

function renderAlert (message) {
  if (!message) {
    return ''
  }
  return `
    <h1 class="alert">${message}</h1>
  `
}

function renderBookBarcodeField () {
  return `
    <div>
      <label for="item-number">
        Book barcode
        <small>3000XXXX</small>
        <small>Located in the upper left back corner</small>
      </label>
      <input type="text" name="term" id="item-number" pattern="3\\d{7}" maxlength="8" />
    </div>
  `
}

function renderCovers (barcodes) {
  // Load images from the index
  chrome.storage.local.get({ covers: {} }, ({ covers }) => {
    barcodes.forEach((barcode) => {
      const image = covers[barcode]
      if (image) {
        renderCover({ barcode, image })
      }
    })
    loadCovers(barcodes)
  })
}

function renderCover ({ barcode, image }) {
  const selector = `.book-cover[data-barcode="${barcode}"]`
  const container = document.querySelector(selector)
  if (!container.childNodes.length) {
    container.innerHTML = `<img src=${image} alt="" />`
  }
}

function loadCovers (barcodes) {
  let started = false

  const container = document.createElement('div')
  container.innerHTML = `
    <iframe id="opac" src="https://opac.libraryworld.com/opac/signin.php?libraryname=ECCLIBRARY" hidden></iframe>
  `
  document.body.appendChild(container)
  const opac = document.getElementById('opac')

  opac.addEventListener('load', () => {
    if (!started) {
      started = true
      loadCover()
    } else {
      opac.contentWindow.postMessage('bookcover', '*')
    }
  })

  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://opac.libraryworld.com') {
      return
    }
    const { data } = event
    chrome.storage.local.get({ covers: {} }, ({ covers }) => {
      covers[data.barcode] = data.image
      chrome.storage.local.set({ covers })
    })
    renderCover(data)
    loadCover()
  })

  function loadCover () {
    if (barcodes.length) {
      const barcode = barcodes.shift()
      opac.src = `https://opac.libraryworld.com/opac/search.php?term=${barcode}`
    } else {
      container.remove()
    }
  }
}

function getToday () {
  const today = new Date()
  return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
}

function displayTitle (value) {
  return value.replace(' : ', ': ').replace(' /', '').replace("'", '&rsquo;')
}

function displayDate (value) {
  const date = new Date(`${value}T00:00`)
  const [ weekday, month, day, year ] = date.toDateString().split(' ')
  return `${month} ${parseInt(day)}, ${year}`
}
