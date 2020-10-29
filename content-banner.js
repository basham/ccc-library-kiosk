renderBanner()

function renderBanner () {
  const banner = document.createElement('div')
  banner.classList.add('ecclib-banner')
  banner.setAttribute('role', 'banner')
  banner.innerHTML = `
    <style>
      .ecclib-banner {
        --color-light-gray: #cccccc;
        --color-black: #333333;
        --color-orange: #b06110;
        --color-white: #ffffff;
        background-color: #ffffff;
        border-bottom: calc(1em/16) solid var(--color-light-gray);
        color: var(--color-black);
        font-family: system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.5rem;
        padding: 1em;
      }
      .ecclib-banner a {
        color: var(--color-orange);
        font-weight: normal;
        text-decoration: underline;
      }
      .ecclib-banner a:hover {
        color: var(--color-orange);
      }
      .ecclib-banner a:focus {
        outline: calc(2em/16) solid var(--color-orange);
        outline-offset: calc(2em/16);
      }
    </style>
    Back to <a href="${chrome.runtime.getURL('blank.html')}">Evangelical Community Church Library</a>
  `
  document.body.prepend(banner)
}
