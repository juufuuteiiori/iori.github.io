(function () {
  if (document.querySelector('script[data-cf-beacon]')) return

  var script = document.createElement('script')
  script.defer = true
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.setAttribute('data-cf-beacon', '{"token":"890870f0f38c4b99aee47a9183a1aa7e"}')
  document.head.appendChild(script)
})()
