settingsId = "@{name}"
elements =
  wrapper: $ 'form#@{id}-settings'
  actions:
    save: $ 'button#settings-save'
    reset: $ 'button#settings-reset'
    purge: $ 'button#settings-purge'

require ["settings"], (settings) ->
  onChange = ->
    # cfg = settings.get()

  settings.sync settingsId, elements.wrapper, onChange

  elements.actions.save.click (e) ->
    e.preventDefault()
    settings.persist settingsId, elements.wrapper, ->
      socket.emit "admin.settings.sync@{Id}"
      onChange()

  elements.actions.reset.click (e) ->
    e.preventDefault()
    settings.sync settingsId, elements.wrapper, onChange

  elements.actions.purge.click (e) ->
    e.preventDefault()
    socket.emit "admin.settings.get@{Id}Defaults", null, (err, data) ->
      return console.error err if err?
      settings.set settingsId, data, elements.wrapper, ->
        socket.emit "admin.settings.sync@{Id}"
        onChange()
