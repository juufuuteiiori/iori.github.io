(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]
    })
  }

  function initFootprintsMap() {
    var el = document.getElementById('footprints-map')
    if (!el || el.dataset.ready === '1' || typeof L === 'undefined') return
    el.dataset.ready = '1'

    var map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)

    // 默认只框日本：北海道到冲绳，不把境外地点算进视野。
    var japanBounds = L.latLngBounds([24.2, 122.9], [45.6, 145.8])
    map.fitBounds(japanBounds, { padding: [8, 8] })

    fetch('/footprints/places.json')
      .then(function (response) {
        if (!response.ok) throw new Error('places')
        return response.json()
      })
      .then(function (places) {
        places.forEach(function (place) {
          if (typeof place.lat !== 'number' || typeof place.lng !== 'number') return
          var marker = L.marker([place.lat, place.lng]).addTo(map)
          var html = '<div class="footprints-popup"><strong>' + escapeHtml(place.name || '') + '</strong>'
          if (place.date) html += '<br>' + escapeHtml(place.date)
          if (place.note) html += '<br>' + escapeHtml(place.note)
          if (place.post) html += '<br><a href="' + encodeURI(place.post) + '">查看文章</a>'
          html += '</div>'
          marker.bindPopup(html)
        })
        function showAll() {
          map.invalidateSize()
          map.fitBounds(japanBounds, { padding: [8, 8] })
        }
        showAll()
        window.addEventListener('load', showAll)
        setTimeout(showAll, 300)
      })
      .catch(function () {
        el.insertAdjacentHTML('afterend', '<p>地点数据没有加载出来。</p>')
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFootprintsMap)
  } else {
    initFootprintsMap()
  }
})()
