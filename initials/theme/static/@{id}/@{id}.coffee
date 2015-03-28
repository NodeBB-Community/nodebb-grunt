###
  Credits to psychobunny and barisusakli for their lavender.js:
    https://github.com/designcreateplay/nodebb-theme-lavender/blob/master/static/lib/lavender.js
###

loadingbar = true
masonry = true
homeCategoryPositionAnimated = true

if masonry && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test navigator.userAgent
  requirejs [
      RELATIVE_PATH + '/css/assets/@{id}/masonry.pkgd.min.js'
      RELATIVE_PATH + '/css/assets/@{id}/imagesloaded.pkgd.min.js'
  ], (Masonry) ->
    $(window).on 'action:ajaxify.end', (e, data) ->
      if data.url == ''
        if $('.home').length
          categories = $ '.row.home > div'
          m = new Masonry categories[0],
            itemSelector: '.category-item'
            columnWidth: '.category-item'
            transitionDuration: if homeCategoryPositionAnimated then '0.4s' else 0
          categories.imagesLoaded ->
            m.layout()

if loadingbar
  ajaxifyGo = ajaxify.go
  loadTemplates = templates.load_template
  refreshTitle = app.refreshTitle
  loadingBar = $ '.loading-bar'

  ajaxify.go = (url, cb, quiet) ->
    loadingBar.addClass('reset').css 'width', '100%'
    ajaxifyGo url, cb, quiet

  templates.load_template = (cb, url, tpl) ->
    setTimeout ->
      loadingBar.removeClass('reset').css 'width', "#{Math.random() * 25 + 5}%"
    , 10
    loadTemplates cb, url, tpl

  app.refreshTitle = (url) ->
    setTimeout (->
      loadingBar.css 'width', '0'), 300
    refreshTitle url