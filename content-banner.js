chrome.storage.local.get('externalBanner', ({ externalBanner }) => {
  if (externalBanner) {
    renderBanner()
  }
})

function renderBanner () {
  const banner = document.createElement('div')
  banner.classList.add('ccclib-banner')
  banner.setAttribute('role', 'banner')
  banner.innerHTML = `
    <style>
      .ccclib-banner {
        --color-black: #333333;
        --color-white: #ffffff;
        align-items: center;
        background-color: var(--color-black);
        border-bottom: calc(1em/16) solid var(--color-white);
        color: var(--color-white);
        display: flex;
        font-family: system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.5rem;
        padding: 0.5em;
      }
      .ccclib-banner img {
        margin-right: 0.5em;
      }
      .ccclib-banner a {
        color: var(--color-white);
        cursor: pointer !important;
        font-weight: normal;
        text-decoration: underline !important;
      }
      .ccclib-banner a:hover {
        color: var(--color-white);
      }
      .ccclib-banner a:focus {
        outline: calc(2em/16) solid var(--color-white) !important;
        outline-offset: calc(2em/16);
      }
      /* Style adjustments for self-checkout software. */
      app-root .main-height {
        --ccclib-banner-height: 49px;
        height: calc(100vh - 258px - var(--ccclib-banner-height));
      }
    </style>
    <img alt="" height="32" width="32" src="${chrome.runtime.getURL('icon128.png')}">
    <span>Return to <a href="${chrome.runtime.getURL('blank.html')}">Christ Community Church Library</a></span>
  `
  document.body.prepend(banner)
}
