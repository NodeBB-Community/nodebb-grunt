<form class="form-horizontal" id="@{id}-settings">
  <div class="row">
    <div class="col-xs-12 col-lg-9">
      <div class="panel panel-default">
        <div class="panel-heading">[[@{id}:name]] [[@{id}:version]] / [[plugins:settings]]</div>

        <div class="panel-body">

          <div class="form-group">
            <label class="col-xs-12 col-sm-3" for="setting1">[[@{id}:settings.setting1]]</label>
            <div class="col-xs-12 col-sm-3">
              <input id="setting1" class="form-control" type="text" data-key="setting1" placeholder="[[@{id}:settings.setting1]]"/>
            </div>
          </div>

          <div class="form-group">
            <label class="col-xs-12 col-sm-3" for="custom">[[@{id}:settings.custom]]</label>
            <div class="col-xs-12 col-sm-3">
              <input id="custom" class="form-control" type="checkbox" data-key="custom" placeholder="[[@{id}:settings.custom]]"/>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="col-xs-12 col-lg-3">
      <div class="panel panel-default">
        <div class="panel-heading">[[plugins:actions.title]]</div>
        <div class="panel-body">
          <div class="form-group">
            <div class="col-xs-12">
              <button type="submit" class="btn btn-primary btn-block" id="@{id}-settings-save" accesskey="s">
                <i class="fa fa-fw fa-save"></i> [[plugins:actions.save]]
              </button>
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <button type="button" class="btn btn-warning btn-block" id="@{id}-settings-reset">
                <i class="fa fa-fw fa-eraser"></i> [[plugins:actions.reset]]
              </button>
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <button type="button" class="btn btn-danger btn-block" id="@{id}-settings-purge">
                <i class="fa fa-fw fa-history"></i> [[plugins:actions.purge]]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</form>

<script type="text/javascript" src="{relative_path}/plugins/@{name}/static/scripts/adminSettings.js"></script>
