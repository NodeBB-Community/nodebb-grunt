meta = module.parent.parent.require '../src/meta'

stringify = (val) ->
  if val instanceof Object then JSON.stringify(val) else val

parse = (val, defVal) ->
  type = typeof defVal
  switch type
    when 'boolean' then val && val != 'false'
    when 'object'
      try
        val = JSON.parse val
      val
    else
      val

merge = (obj1, obj2) ->
  for key, val2 of obj2
    val1 = obj1[key]
    if !obj1.hasOwnProperty(key)
      obj1[key] = val2
    else if typeof val2 == 'object'
      if typeof val1 == 'object'
        merge val1, val2
      else
        obj1[key] = val2

class Configuration
  id: ''
  defCfg: {}
  debug: false
  constructor: (data, defCfg, debug = false, forceUpdate = false, reset = false) ->
    defCfg._version = data.version
    this.id = data.name
    this.defCfg = defCfg
    this.debug = debug
    if reset then this.reset() else this.checkStructure forceUpdate
  _log: ->
    console.log "Configuration (#{this.id}):", arguments... if this.debug
  dbg: (delay = 0) ->
    return if !this.debug
    if delay
      _this = this
      setTimeout ->
        this._log _this.get()
      , delay
    else
      this._log this.get()
  get: (key = null, def = null) ->
    if !key
      obj = {}
      obj[k] = this.get k, v for k, v of this.defCfg
      return obj
    if !def?
      def = this.defCfg[key]
    val = meta.config["#{this.id}:#{key}"]
    if val then parse val, def else def
  set: (key, val, cb) ->
    meta.configs.set "#{this.id}:#{key}", stringify(val), cb
  setOnEmpty: ->
    for key, val of this.defCfg
      meta.configs.setOnEmpty "#{this.id}:#{key}", stringify val
  reset: ->
    this._log 'Reset initiated.'
    _this = this
    meta.configs.list (ignored, obj) ->
      meta.configs.remove key for key of obj when key.search("#{_this.id}:") == 0
      _this.set key, val for key, val of _this.defCfg
      _this.dbg 100
  checkStructure: (force) ->
    if !force && this.get('_version', '0.0.0') == this.defCfg._version
      this.dbg()
    else
      this._log 'Structure-update initiated.'
      _this = this
      meta.configs.list (ignored, obj) ->
        conf = _this.get()
        merge conf, _this.defCfg
        conf._version = _this.defCfg._version
        meta.configs.remove key for key of obj when key.search("#{_this.id}:") == 0
        _this.set key, conf[key] for key of _this.defCfg
        _this.dbg 100

module.exports = Configuration