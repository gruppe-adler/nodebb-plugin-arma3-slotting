<div class="match-definition-container">
	
	<span class="match-template-label">Slotliste XML</span>
	<!-- <span class="match-definition-debug">ID: {matchid}</span>-->

	<button id="match-edit-submit" class="btn btn-primary" type="submit" form="match-definition-form"><i class="fa fa-check"></i> Änderungen speichern</button>
	<!-- <button id="match-dtd" class="btn btn-default">DTD anzeigen</button> -->
	<a href="/topic/{tid}" id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-times"></i> Abbrechen</a>

	<div class="match-template-settings">
		<ul>
			<li>
				<label class="switch">
				  <input type="checkbox">
				  <div class="slider round"></div>
				</label>
				Rufname
			</li>
			<li>
				<label class="switch">
				  <input type="checkbox">
				  <div class="slider round"></div>
				</label>
				Fahrzeugtyp
			</li>
			<li>
				<label class="switch">
				  <input type="checkbox">
				  <div class="slider round"></div>
				</label>
				Funkfrequenz
			</li>
			<li>
				<label class="switch">
				  <input type="checkbox">
				  <div class="slider round"></div>
				</label>
				LobbyBezeichner
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
				<li><a href="#" data-template="rifleman">Schütze</a></li>
				<li><a href="#" data-template="mggunner">MG-Schütze</a></li>
				<li><a href="#" data-template="atgunner">AT-Schütze</a></li>
				<li><a href="#" data-template="medic">Sanitäter</a></li>
				<li><a href="#" data-template="teamleader">Truppführer</a></li>
				<li><a href="#" data-template="squadmedic">Zug-Sanitäter</a></li>
				<li><a href="#" data-template="squadleader">Zugführer</a></li>
				<li><a href="#" data-template="platoonmedic">Kompanie-Sanitäter</a></li>
				<li><a href="#" data-template="platoonleader">Kompanieführer</a></li>
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
				<li><a href="#">Trupp-3</a></li>
				<li><a href="#">Trupp-4</a></li>
				<li><a href="#">Trupp-5</a></li>
				<li><a href="#">Zug-9</a></li>
				<li><a href="#">Kompanie</a></li>
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
				<li><a href="#">Motor-Inf</a></li>
				<li><a href="#">Mech-Inf</a></li>
				<li><a href="#">Kpz</a></li>
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
				<li><a href="#">Breaking Contact</a></li>
				<li><a href="#">Endgame</a></li>
				<li><a href="#">Holding Point</a></li>
				<li><a href="#">Money in the Mist</a></li>
				<li><a href="#">Urban Ops</a></li>
				<li><a href="#">Rattrap</a></li>
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
