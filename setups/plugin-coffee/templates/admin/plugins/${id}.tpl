<h1>${name} v@{version}</h1>
<hr />

<form>
  <p>
    Adjust these settings. You can then retrieve these settings in code via:
    <code>cfg.get 'setting1'</code> and <code>cfg.get 'setting2'</code>
  </p><br />
  <div class="alert alert-info">
    <p>
      <label for="Setting 1">Setting 1</label>
      <input type="text" data-field="${id}:setting1" title="Setting 1" class="form-control" placeholder="Setting 1"><br />
      <label for="Setting 2">Setting 2</label>
      <input type="text" data-field="${id}:setting2" title="Setting 2" class="form-control" placeholder="Setting 2">
    </p>
  </div>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
  require(['forum/admin/settings'], function(Settings) {
    Settings.prepare();
  });
</script>