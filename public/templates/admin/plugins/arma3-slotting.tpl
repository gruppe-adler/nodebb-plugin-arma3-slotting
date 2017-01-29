<h1><i class="fa {faIcon}"></i> {name}</h1>

<form role="form" class="{nbbId}-settings">
	<fieldset>
		<div class="row">
			<div class="col-sm-12">
				<div class="form-group">
					<label for="api-key">API key, to be sent as X-Api-Key header</label>
					<input placeholder="API key" type="text" class="form-control" id="api-key" name="api-key" />
				</div>
			</div>
		</div>
        <hr />
		<button class="btn btn-lg btn-primary" id="save" type="button">Save</button>
	</fieldset>
</form>

<script type="text/javascript">
	require(['settings'], function(Settings) {
		var nbbId = '{nbbId}',
		    klass = nbbId + '-settings',
		    wrapper = $('.' + klass);

		Settings.load(nbbId, wrapper);

		wrapper.find('#save').on('click', function(e) {
			e.preventDefault();
			Settings.save(nbbId, wrapper, function() {
				socket.emit('admin.restart');
			});
		});


	});
</script>
