document.querySelectorAll('body > *').forEach((el) => {
  el.setAttribute('hidden', 'true')
})
document.querySelectorAll('link').forEach((el) => {
  el.remove()
})

document.title = 'Scan your library card - Evangelical Community Church'

const container = document.createElement('div')
document.body.appendChild(container)

container.innerHTML = `
  <header>
    <a href="#" class="logo">
      <img src="${chrome.runtime.getURL('ecc-logo-white.png')}" alt="Evangelical Community Church" />
      <span>Library</span>
    </a>
  </header>
  <main>
    <h1>Scan your library card</h1>
    <form method="GET" action="/cgi-bin/selfservice.pl" autocomplete="off">
      <div class="control control--small">
        <label for="library-card-number">
          Library card number
          <small>2000XXXX</small>
        </label>
        <input type="text" name="term" id="library-card-number" value="">
      </div>
      <div class="button-group">
        <button type="submit">Continue</button>
      </div>
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
    <p>Expect the card to be printed and placed in the filing box within a week. If you want to check out books or other materials today, ask a <b>library helper</b> for assistance. If no one is available, write down:</p>
    <ol>
      <li>Your name, email, and phone number</li>
      <li>Current date</li>
      <li>Titles and barcode numbers (located in the upper left back corner, in the format of <b>3000XXXX</b>) of any books and materials you are borrowing</li>
    </ol>
  </main>
`

focus()
// document.addEventListener('keyup', focus)

function focus () {
  document.getElementById('library-card-number').focus()
}
