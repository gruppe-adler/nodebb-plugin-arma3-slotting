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
			<li>
				<label class="switch boolean_natosymbol">
				  <input type="checkbox">
				  <div class="slider round"></div>
				  <div class="switch_label">NATO Symbol</div>
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
				<li><a href="#" class="match-template-button" data-template="rifleman" data-closing="></slot>">Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="mggunner" data-closing="></slot>">MG-Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="mgassistant" data-closing="></slot>">MG-Assist</a></li>
				<li><a href="#" class="match-template-button" data-template="atgunner" data-closing="></slot>">AT-Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="medic" data-closing="></slot>">Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="teamleader" data-closing="></slot>">Truppführer</a></li>
				<li><a href="#" class="match-template-button" data-template="squadmedic" data-closing="></slot>">Zug-Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="squadleader" data-closing="></slot>">Zugführer</a></li>
				<li><a href="#" class="match-template-button" data-template="platoonmedic" data-closing="></slot>">Kompanie-Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="platoonleader" data-closing="></slot>">Kompanieführer</a></li>
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
				<li><a href="#" class="match-template-button" data-template="fireteam-3" data-closing="></fireteam>">Trupp-3</a></li>
				<li><a href="#" class="match-template-button" data-template="fireteam-4" data-closing="></fireteam>">Trupp-4</a></li>
				<li><a href="#" class="match-template-button" data-template="fireteam-5" data-closing="></fireteam>">Trupp-5</a></li>
				<li><a href="#" class="match-template-button" data-template="squad-9" data-closing="></squad>">Zugtrupp-9</a></li>
				<li><a href="#" class="match-template-button" data-template="platoon" data-closing="></platoon>">Zug</a></li>
				<li><a href="#" class="match-template-button" data-template="company" data-closing="></company>">Kompanie</a></li>
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
				<li><a href="#" class="match-template-button" data-template="motor-inf" data-closing="></squad>">Motor-Inf</a></li>
				<li><a href="#" class="match-template-button" data-template="mech-inf" data-closing="></squad>">Mech-Inf</a></li>
				<li><a href="#" class="match-template-button" data-template="mbt" data-closing="></squad>">Kpz</a></li>
			</ul>
		</li>

		<li>
			<div class="btn-group bottom-sheet">
			<button class="btn btn-default dropdown-toggle tag" data-toggle="dropdown" data-template="unit_roles" type="button" aria-expanded="true">
			<span class="visible-sm-inline visible-md-inline visible-lg-inline">NATO Symbole</span>
			<span class="visible-xs-inline"><i class="fa fa-fw fa-sort"></i></span>
			<span class="caret"></span>
			</button>

			<ul class="dropdown-menu pull-right">
				<li><a href="#" class="match-template-button" data-template="empty" data-closing="inf">Infanterie</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="motor_inf">Motorisierte Infanterie</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="mech_inf">Mechanisierte Infanterie</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="recon">Recon</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="mortar">Mörser</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="art">Artillerie</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="armor">Panzer</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="air">Helikopter</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="air">Flugzeug</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="uav">Drohne</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="hq">HQ</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="med">Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="maint">Reparatur</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="service">Logistik</a></li>
				<li><a href="#" class="match-template-button" data-closing="empty" data-closing="support">Support</a></li>
				
			</ul>
		</li>

		<li style="float: right;">
			<div class="btn-group bottom-sheet">
			<button class="btn btn-default dropdown-toggle tag" data-toggle="dropdown" data-template="unit_roles" type="button" aria-expanded="true">
			<span class="visible-sm-inline visible-md-inline visible-lg-inline">Missionstemplates</span>
			<span class="visible-xs-inline"><i class="fa fa-fw fa-sort"></i></span>
			<span class="caret"></span>
			</button>

			<ul class="dropdown-menu pull-right">
				<li><a href="#" class="match-template-button" data-closing="">Breaking Contact</a></li>
				<li><a href="#" class="match-template-button" data-closing="">Endgame</a></li>
				<li><a href="#" class="match-template-button" data-closing="">Holding Point</a></li>
				<li><a href="#" class="match-template-button" data-closing="">Money in the Mist</a></li>
				<li><a href="#" class="match-template-button" data-closing="">Urban Ops</a></li>
				<li><a href="#" class="match-template-button" data-closing="">Rattrap</a></li>
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
