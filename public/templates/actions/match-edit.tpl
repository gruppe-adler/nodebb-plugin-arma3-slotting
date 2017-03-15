<div class="match-definition-container">
	
	<div class="match-definition-header">
		<span class="match-template-label">Slotliste XML</span>
		<!-- <span class="match-definition-debug">ID: {matchid}</span>-->

		<button id="match-edit-submit" class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Änderungen speichern</button>
		<!-- <button id="match-dtd" class="btn btn-default">DTD anzeigen</button> -->
		<a href="/topic/{tid}" id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-times"></i> Abbrechen</a>
	</div>

	<div class="match-template-settings">
		<ul>
			<li>
				<label class="switch boolean_callsign">
				  <input type="checkbox">
				  <div class="slider round"></div>
				  <div class="switch_label">Rufname</div>
				</label>
				
			</li>
			<li>
				<label class="switch boolean_vehicletype">
				  <input type="checkbox">
				  <div class="slider round"></div>
				  <div class="switch_label">Fahrzeugtyp</div>
				</label>
				
			</li>
			<li>
				<label class="switch boolean_radiofrequency">
				  <input type="checkbox">
				  <div class="slider round"></div>
				  <div class="switch_label">Funkfrequenz</div>
				</label>
				
			</li>
			<li>
				<label class="switch boolean_ingamelobby">
				  <input type="checkbox">
				  <div class="slider round"></div>
				  <div class="switch_label">LobbyBezeichner</div>
				</label>
				
			</li>

		</ul>
	</div>

	<ul class="match-template-buttons">

		<li>
			<div class="btn-group bottom-sheet">
			<button class="btn btn-default dropdown-toggle tag" data-toggle="dropdown" data-template="unit_roles" type="button" aria-expanded="true">
			<span class="visible-sm-inline visible-md-inline visible-lg-inline">Rollen</span>
			<span class="visible-xs-inline"><i class="fa fa-fw fa-sort"></i></span>
			<span class="caret"></span>
			</button>

			<ul class="dropdown-menu pull-right">
				<li><a href="#" class="match-template-button" data-template="rifleman">Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="mggunner">MG-Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="mgassistant">MG-Assist</a></li>
				<li><a href="#" class="match-template-button" data-template="atgunner">AT-Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="medic">Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="teamleader">Truppführer</a></li>
				<li><a href="#" class="match-template-button" data-template="squadmedic">Zug-Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="squadleader">Zugführer</a></li>
				<li><a href="#" class="match-template-button" data-template="platoonmedic">Kompanie-Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="platoonleader">Kompanieführer</a></li>
			</ul>
		</li>

		<li>
			<div class="btn-group bottom-sheet">
			<button class="btn btn-default dropdown-toggle tag" data-toggle="dropdown" data-template="unit_roles" type="button" aria-expanded="true">
			<span class="visible-sm-inline visible-md-inline visible-lg-inline">Einheiten Basiselemente</span>
			<span class="visible-xs-inline"><i class="fa fa-fw fa-sort"></i></span>
			<span class="caret"></span>
			</button>

			<ul class="dropdown-menu pull-right">
				<li><a href="#" class="match-template-button">Trupp-3</a></li>
				<li><a href="#" class="match-template-button">Trupp-4</a></li>
				<li><a href="#" class="match-template-button">Trupp-5</a></li>
				<li><a href="#" class="match-template-button">Zug-9</a></li>
				<li><a href="#" class="match-template-button">Kompanie</a></li>
			</ul>
		</li>

		<li>
			<div class="btn-group bottom-sheet">
			<button class="btn btn-default dropdown-toggle tag" data-toggle="dropdown" data-template="unit_roles" type="button" aria-expanded="true">
			<span class="visible-sm-inline visible-md-inline visible-lg-inline">Einheiten kombiniert</span>
			<span class="visible-xs-inline"><i class="fa fa-fw fa-sort"></i></span>
			<span class="caret"></span>
			</button>

			<ul class="dropdown-menu pull-right">
				<li><a href="#" class="match-template-button">Motor-Inf</a></li>
				<li><a href="#" class="match-template-button">Mech-Inf</a></li>
				<li><a href="#" class="match-template-button">Kpz</a></li>
			</ul>
		</li>

		<li>
			<div class="btn-group bottom-sheet">
			<button class="btn btn-default dropdown-toggle tag" data-toggle="dropdown" data-template="unit_roles" type="button" aria-expanded="true">
			<span class="visible-sm-inline visible-md-inline visible-lg-inline">Missionstemplates</span>
			<span class="visible-xs-inline"><i class="fa fa-fw fa-sort"></i></span>
			<span class="caret"></span>
			</button>

			<ul class="dropdown-menu pull-right">
				<li><a href="#" class="match-template-button">Breaking Contact</a></li>
				<li><a href="#" class="match-template-button">Endgame</a></li>
				<li><a href="#" class="match-template-button">Holding Point</a></li>
				<li><a href="#" class="match-template-button">Money in the Mist</a></li>
				<li><a href="#" class="match-template-button">Urban Ops</a></li>
				<li><a href="#" class="match-template-button">Rattrap</a></li>
			</ul>
		</li>
	</ul>


	



	<form data-matchid="{matchid}" data-tid="{tid}" id="match-definition-form">
		<textarea id="match-definition">
			{spec}
		</textarea>
	</form>
	<script>
		/*global require*/
		require(['arma3-slotting/formatXml'], function (formatXml) {
		    var textarea = $('#match-definition')[0];
			textarea.value = formatXml(textarea.value.trim());
		});
	</script>
	
</div>
