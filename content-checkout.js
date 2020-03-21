init()

function init () {
  document.querySelectorAll('body > *').forEach((el) => {
    //el.setAttribute('hidden', 'true')
  })
  document.querySelectorAll('link').forEach((el) => {
    el.remove()
  })

  const params = (new URL(document.location)).searchParams
  const command = params.get('command')
  const term = params.get('term')
  const props = { command, term }

  if (!command && !term) {
    return renderScanCard(props)
  }

  if (command === 'checkout' && !term) {
    return renderScanCard(props)
  }

  if (command === 'checkout' && term) {
    return renderPatron(props)
  }
}

function render ({ title, content }) {
  const name = 'Evangelical Community Church Library'

  document.title = [ title, name ].join(' - ')

  const container = document.createElement('div')
  container.innerHTML = `
    <header>
      <a href="${chrome.runtime.getURL('blank.html')}" class="logo">
        <img src="${chrome.runtime.getURL('ecc-logo-white.png')}" alt="${name}" />
        <span>Library</span>
      </a>
    </header>
    <main>${content}</main>
  `
  document.body.appendChild(container)
}

function renderScanCard () {
  const title = 'Scan your library card'
  const content = `
    <h1>${title}</h1>
    <form method="GET" action="/cgi-bin/selfservice.pl" autocomplete="off">
      <div>
        <label for="library-card-number">
          Library card number
          <small>2000XXXX</small>
        </label>
        <input type="text" name="term" id="library-card-number" class="ecclib-width-small" pattern="2\\d{7}" maxlength="8">
      </div>
      <button type="submit">Continue</button>
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
    <p>Expect the card to be printed and placed in the filing box within a week. If you want to check out books or other materials today, ask a <b>library helper</b> for assistance. If no one is available, write down:</p>
    <ol>
      <li>Your name, email, and phone number</li>
      <li>Current date</li>
      <li>Titles and barcode numbers (located in the upper left back corner, in the format of <b>3000XXXX</b>) of any books and materials you are borrowing</li>
    </ol>
  `
  render({ title, content })
  document.getElementById('library-card-number').focus()
}

function renderPatron () {
  const error = document.querySelector('font[color="#ff0000"]')
  const errorMessage = error ? error.textContent.toLowerCase() : ''
  const isInvalid = errorMessage.includes('invalid')
  const isNotAvailable = errorMessage.includes('not available')

  const success = document.querySelector('font[color="#347c17"]')
  const successMessage = success ? success.textContent.toLowerCase() : ''
  const isCheckedOut = successMessage.includes('checked out')

  const alertMessage = [
    isInvalid ? '😱 Item not found' : '',
    isNotAvailable ? '😱 Item already checked out' : '',
    isCheckedOut ? '✅ Item successfully checked out' : ''
  ]
    .filter((message) => message.length)[0] || ''

  const goodpatron = document.querySelector('input[name="goodpatron"]').value

  const patronData = document.querySelector('td[width="400"]').childNodes
  const libraryCardNumber = patronData[1].textContent.trim()
  const [ lastName = '', firstName = '' ] = patronData[13].textContent.trim().split(', ')
  const name = `${firstName} ${lastName}`
  const email = patronData[15].textContent.trim()

  const today = (new Date()).toJSON().substring(0, 10)
  const checkouts = [ ...document.getElementById('checkout_table').querySelectorAll('tr') ]
    .filter((row, index) => index > 0)
    .map((row) => {
      const [ status, barcode, title, callNumber, outDateRaw, dueDateRaw ] = [ ...row.childNodes ]
        .map((el) => el.textContent.trim())
      const outDate = displayDate(outDateRaw)
      const dueDate = displayDate(dueDateRaw)
      const isOverdue = dueDateRaw < today
      return { barcode, title, callNumber, outDate, dueDate, isOverdue }
    })

  const title = 'Check out'
  const content = `
    ${renderAlert(alertMessage)}
    <h1>${title}</h1>
    <form method="GET" action="/cgi-bin/selfservice.pl" autocomplete="off">
      <div>
        <label for="item-number">
          Book barcode
          <small>3000XXXX</small>
          <small>Located in the upper left back corner</small>
        </label>
        <input type="text" name="term" id="item-number" class="ecclib-width-small" pattern="3\\d{7}" maxlength="8">
      </div>
      <button type="submit">Check out</button>
      <input type="hidden" name="goodpatron" value="${goodpatron}">
      <input type="hidden" name="command" value="checkout">
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
    ${renderCheckouts(checkouts)}
  `
  render({ title, content })
  document.getElementById('item-number').focus()
}

function renderAlert (message) {
  if (!message) {
    return ''
  }
  return `
    <div class="alert">
      <h2>${message}</h2>
    </div>
  `
}

function renderCheckouts (checkouts) {
  if (!checkouts.length) {
    return `<p>No checkouts</p>`
  }
  return checkouts.map(renderCheckout).join('')
}

function renderCheckout (checkout) {
  const { title, outDate, dueDate, callNumber, barcode, isOverdue } = checkout
  return `
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
        <dt>Call number</dt>
        <dd>${callNumber}</dd>
      </div>
      <div>
        <dt>Barcode</dt>
        <dd>${barcode}</dd>
      </div>
    </dl>
  `
}

function displayDate (value) {
  const date = new Date(`${value}T00:00`)
  const [ weekday, month, day, year ] = date.toDateString().split(' ')
  return `${month} ${parseInt(day)}, ${year}`
}
