(function () {
  if (document.querySelector('script[data-cf-beacon]')) return

  var script = document.createElement('script')
  script.defer = true
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.setAttribute('data-cf-beacon', '{"token":"7a449b24dbe849ea9fa282c87b405932"}')
  document.head.appendChild(script)
})()
