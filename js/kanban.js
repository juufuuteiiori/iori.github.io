(function () {
  var STORAGE_KEY = 'kanban-dismissed'
  var REACTIONS = ['talk', 'happy']
  var TALK_MS = 2000

  function dismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch (err) {
      return false
    }
  }

  function pageKind() {
    var path = location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/'
    if (path === '/' || /^\/page\/\d+$/.test(path)) return 'home'
    if (path === '/footprints') return 'footprints'
    if (path === '/about') return 'about'
    if (document.querySelector('.post-page-container')) return 'post'
    return 'other'
  }

  function greeting() {
    var hour = new Date().getHours()
    if (hour < 5) return 'まだ起きていますか'
    if (hour < 11) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'こんばんは'
  }

  function linesFor(kind) {
    var hello = greeting()
    if (kind === 'home') {
      return [hello, 'ようこそ、いおりの博客へ', 'ごきげんよう', '今日も博物館日和ですね']
    }
    if (kind === 'footprints') {
      return [hello, '足跡は地図に残してあります', '次はどこへ行きましょう', '旅の記録は、ここから開けます']
    }
    if (kind === 'about') {
      return [hello, '単推は儒烏風亭らでんです', '非公式のファンアートです', 'はじめまして']
    }
    if (kind === 'post') return ['静かにどうぞ', '読み終わったら、また']
    return [hello, 'ごきげんよう', 'さようならでん', '今日も博物館日和ですね']
  }

  function atPostEnd() {
    var nav = document.querySelector('.post-nav')
    var box = nav || document.querySelector('.post-page-container')
    if (!box) return false
    var rect = box.getBoundingClientRect()
    if (nav) return rect.top < window.innerHeight - 24
    return rect.bottom < window.innerHeight + 40
  }

  function shouldDodge(event) {
    var el = document.elementFromPoint(event.clientX, event.clientY)
    if (!el || el.closest('#kanban, #kanban-open')) return false
    if (el.closest('.side-tools, .post-nav')) return true
    return window.innerWidth - event.clientX < 64 && window.innerHeight - event.clientY < 240
  }

  function showLauncher() {
    var btn = document.getElementById('kanban-open')
    if (btn) btn.hidden = false
  }

  function mountLauncher() {
    if (document.getElementById('kanban-open')) return

    var btn = document.createElement('button')
    btn.id = 'kanban-open'
    btn.type = 'button'
    btn.className = 'kanban-open'
    btn.setAttribute('aria-label', '打开看板娘')
    btn.textContent = '看板娘'
    btn.hidden = !dismissed()
    btn.addEventListener('click', function () {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {}
      btn.hidden = true
      mount()
    })
    document.body.appendChild(btn)
  }

  function mount() {
    if (dismissed() || document.getElementById('kanban')) return

    var root = document.createElement('aside')
    root.id = 'kanban'
    root.className = 'kanban'
    root.innerHTML =
      '<div class="kanban-bob">' +
      '<p class="kanban-bubble" hidden></p>' +
      '<button type="button" class="kanban-hit" aria-label="看板娘">' +
      '<img class="is-on" data-face="normal" src="/images/kanban/raden-normal.webp" alt="看板娘">' +
      '<img data-face="blink" src="/images/kanban/raden-blink.webp" alt="">' +
      '<img data-face="talk" src="/images/kanban/raden-talk.webp" alt="">' +
      '<img data-face="happy" src="/images/kanban/raden-happy.webp" alt="">' +
      '</button>' +
      '</div>' +
      '<button type="button" class="kanban-close" aria-label="关闭看板娘">×</button>'

    document.body.appendChild(root)

    var faces = {}
    root.querySelectorAll('[data-face]').forEach(function (img) {
      faces[img.getAttribute('data-face')] = img
    })
    var bubble = root.querySelector('.kanban-bubble')
    var locked = false
    var blinkTimer = 0
    var backTimer = 0
    var talkTimer = 0
    var lastKind = ''

    function show(name) {
      Object.keys(faces).forEach(function (key) {
        faces[key].classList.toggle('is-on', key === name)
      })
    }

    function hideTalk() {
      window.clearTimeout(talkTimer)
      bubble.hidden = true
      if (!locked) return
      show('normal')
      locked = false
    }

    function applyPage() {
      var kind = pageKind()
      if (kind !== lastKind) {
        lastKind = kind
        hideTalk()
      }
      root.classList.toggle('is-compact', kind === 'post' && !atPostEnd())
    }

    function scheduleBlink() {
      var wait = 3000 + Math.random() * 3000
      blinkTimer = window.setTimeout(function () {
        if (locked) {
          scheduleBlink()
          return
        }
        show('blink')
        backTimer = window.setTimeout(function () {
          if (!locked) show('normal')
          scheduleBlink()
        }, 150)
      }, wait)
    }

    root.querySelector('.kanban-hit').addEventListener('click', function () {
      if (locked) return
      locked = true
      window.clearTimeout(backTimer)
      var pool = linesFor(lastKind || pageKind())
      show(REACTIONS[Math.floor(Math.random() * REACTIONS.length)])
      bubble.textContent = pool[Math.floor(Math.random() * pool.length)]
      bubble.hidden = false
      talkTimer = window.setTimeout(hideTalk, TALK_MS)
    })

    bubble.addEventListener('click', hideTalk)

    root.querySelector('.kanban-close').addEventListener('click', function () {
      window.clearTimeout(blinkTimer)
      window.clearTimeout(backTimer)
      window.clearTimeout(talkTimer)
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch (err) {}
      root.remove()
      showLauncher()
    })

    root._kanbanSync = applyPage
    applyPage()
    scheduleBlink()
  }

  function sync() {
    mountCredit()
    var root = document.getElementById('kanban')
    if (root && root._kanbanSync) root._kanbanSync()
  }

  function mountCredit() {
    var footer = document.querySelector('footer.footer')
    if (!footer || footer.querySelector('.kanban-credit')) return

    var line = document.createElement('div')
    line.className = 'info-item kanban-credit'
    line.textContent = '看板娘立绘为非公式ファンアート'
    footer.appendChild(line)
  }

  function bindGlobal() {
    var queued = false
    window.addEventListener('scroll', function () {
      if (queued) return
      queued = true
      window.requestAnimationFrame(function () {
        queued = false
        sync()
      })
    }, { passive: true })

    window.addEventListener('pointermove', function (event) {
      var dodge = shouldDodge(event)
      var root = document.getElementById('kanban')
      var launcher = document.getElementById('kanban-open')
      if (root) root.classList.toggle('is-aside', dodge)
      if (launcher) launcher.classList.toggle('is-aside', dodge)
    })

    document.addEventListener('pjax:complete', sync)
  }

  function start() {
    mountLauncher()
    mount()
    mountCredit()
  }

  if (!window.__kanbanStarted) {
    window.__kanbanStarted = true
    bindGlobal()
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start)
    } else {
      start()
    }
  } else {
    sync()
  }
})()
