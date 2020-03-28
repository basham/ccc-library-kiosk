window.addEventListener('message', (event) => {
  if (event.origin !== 'http://circ.libraryworld.com') {
    return
  }
  if (event.data === 'bookcover') {
    const barcode = document.querySelector('input[name="term"]').value
    const image = document.querySelector('img[alt="Book Jacket"]').src
    event.source.postMessage({ barcode, image }, event.origin)
  }
})
