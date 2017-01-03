;(function(window) {

  var svgSprite = '<svg>' +
    '' +
    '<symbol id="icon-iconfontclosesmall" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M596.722 511.999 924.94 183.781c23.299-23.299 23.299-61.422 0-84.721s-61.422-23.299-84.721 0L512.001 427.278 183.781 99.06c-23.299-23.299-61.422-23.299-84.721 0s-23.299 61.422 0 84.721L427.28 511.999 99.06 840.219c-23.299 23.299-23.299 61.422 0 84.721s61.422 23.299 84.721 0l328.219-328.219L840.219 924.94c23.299 23.299 61.422 23.299 84.721 0s23.299-61.422 0-84.721L596.722 511.999z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-daohang3" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M888.71 88.686l-776.723 345.642c-58.254 27.185-54.371 54.371 7.767 66.021l260.202 42.72c42.72 7.767 85.439 46.604 93.206 89.324l54.371 271.853c11.651 62.138 42.72 66.021 69.905 7.767l349.525-761.188c27.185-62.138 0-89.324-58.254-62.138z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '<symbol id="icon-daohang2" viewBox="0 0 1024 1024">' +
    '' +
    '<path d="M945.063 122.32h-863.547c-31.373 0-56.812 25.437-56.812 56.812v22.725c0 31.373 25.437 56.812 56.812 56.812h863.541c31.373 0 56.812-25.437 56.812-56.812v-22.725c0.005-31.373-25.426-56.812-56.797-56.812zM945.063 440.461h-863.547c-31.373 0-56.812 25.437-56.812 56.812v22.725c0 31.373 25.437 56.812 56.812 56.812h863.541c31.373 0 56.812-25.437 56.812-56.812v-22.725c0.005-31.373-25.426-56.812-56.797-56.812zM945.063 758.62h-863.547c-31.373 0-56.812 25.437-56.812 56.812v22.725c0 31.373 25.437 56.812 56.812 56.812h863.541c31.373 0 56.812-25.426 56.812-56.812v-22.725c0.005-31.382-25.426-56.812-56.797-56.812z"  ></path>' +
    '' +
    '</symbol>' +
    '' +
    '</svg>'
  var script = function() {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  }()
  var shouldInjectCss = script.getAttribute("data-injectcss")

  /**
   * document ready
   */
  var ready = function(fn) {
    if (document.addEventListener) {
      if (~["complete", "loaded", "interactive"].indexOf(document.readyState)) {
        setTimeout(fn, 0)
      } else {
        var loadFn = function() {
          document.removeEventListener("DOMContentLoaded", loadFn, false)
          fn()
        }
        document.addEventListener("DOMContentLoaded", loadFn, false)
      }
    } else if (document.attachEvent) {
      IEContentLoaded(window, fn)
    }

    function IEContentLoaded(w, fn) {
      var d = w.document,
        done = false,
        // only fire once
        init = function() {
          if (!done) {
            done = true
            fn()
          }
        }
        // polling for no errors
      var polling = function() {
        try {
          // throws errors until after ondocumentready
          d.documentElement.doScroll('left')
        } catch (e) {
          setTimeout(polling, 50)
          return
        }
        // no errors, fire

        init()
      };

      polling()
        // trying to always fire before onload
      d.onreadystatechange = function() {
        if (d.readyState == 'complete') {
          d.onreadystatechange = null
          init()
        }
      }
    }
  }

  /**
   * Insert el before target
   *
   * @param {Element} el
   * @param {Element} target
   */

  var before = function(el, target) {
    target.parentNode.insertBefore(el, target)
  }

  /**
   * Prepend el to target
   *
   * @param {Element} el
   * @param {Element} target
   */

  var prepend = function(el, target) {
    if (target.firstChild) {
      before(el, target.firstChild)
    } else {
      target.appendChild(el)
    }
  }

  function appendSvg() {
    var div, svg

    div = document.createElement('div')
    div.innerHTML = svgSprite
    svgSprite = null
    svg = div.getElementsByTagName('svg')[0]
    if (svg) {
      svg.setAttribute('aria-hidden', 'true')
      svg.style.position = 'absolute'
      svg.style.width = 0
      svg.style.height = 0
      svg.style.overflow = 'hidden'
      prepend(svg, document.body)
    }
  }

  if (shouldInjectCss && !window.__iconfont__svg__cssinject__) {
    window.__iconfont__svg__cssinject__ = true
    try {
      document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>");
    } catch (e) {
      console && console.log(e)
    }
  }

  ready(appendSvg)


})(window)