<div class="match-definition-container">

	<div class="match-definition-header">
		<span class="match-template-label">Slotliste XML: Neues Match</span>
		<!-- <span class="match-definition-debug">ID: {matchid}</span>-->

		<button id="match-add-submit" class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Slotliste speichern</button>
		<!-- <button id="match-dtd" class="btn btn-default">DTD anzeigen</button> -->
		<a href="/topic/{tid}" id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-times"></i> Abbrechen</a>
	</div>

	
	<div class="match-template-settings">
		<ul>
			<li>
				<label class="switch">
				  <input type="checkbox" id="boolean_language_eng">
				  <div class="slider round"></div>
				  <div class="switch_label">Slots Englisch</div>
				</label>
			</li>
			<li class="match-help pull-right">
			<a href="https://wiki.gruppe-adler.de/index.php?title=Slotting-Plugin" target="_new"><i class="fa fa-question-circle" style="margin-right:5px;"></i>Readme im Wiki</a>
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
				
		        <li><a href="#" class="match-template-button" data-template="slot_rifleman" data-localized="true" data-name="Schütze" data-skip="true">Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_mggunner" data-name="MG-Schütze" data-localized="true" data-skip="true">MG-Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_mgassistant" data-name="MG-Assi" data-localized="true" data-skip="true">MG-Assi</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_atgunner" data-name="AT-Schütze" data-localized="true" data-skip="true">AT-Schütze</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_medic" data-name="Sanitäter" data-localized="true" data-skip="true">Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_teamleader" data-name="Truppführer" data-localized="true" data-skip="true">Truppführer</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_squadmedic" data-name="Zug-Sanitäter" data-localized="true" data-skip="true">Zug-Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_squadleader" data-name="Zugführer" data-localized="true" data-skip="true">Zugführer</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_platoonmedic" data-name="Kompanie-Sanitäter" data-localized="true" data-skip="true">Kompanie-Sanitäter</a></li>
				<li><a href="#" class="match-template-button" data-template="slot_platoonleader" data-name="Kompanieführer" data-localized="true" data-skip="true">Kompanieführer</a></li>
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
				<li><a href="#" class="match-template-button" data-localized="true" data-template="basic_fireteam-3" data-name="Trupp-3">Trupp-3</a></li>
				<li><a href="#" class="match-template-button" data-localized="true" data-template="basic_fireteam-4" data-name="Trupp-4">Trupp-4</a></li>
				<li><a href="#" class="match-template-button" data-localized="true" data-template="basic_fireteam-5" data-name="Trupp-5">Trupp-5</a></li>
				<li><a href="#" class="match-template-button" data-localized="true" data-template="basic_squad-9" data-name="Gruppe-9">Gruppe-9</a></li>
				<li><a href="#" class="match-template-button" data-localized="true" data-template="basic_platoon-3" data-name="Zug-3">Zug-3</a></li>
				<li><a href="#" class="match-template-button" data-localized="true" data-template="basic_company-3" data-name="Kompanie-3">Kompanie-3</a></li>
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
				<li>
				<small style="display: block; padding: 10px; border-bottom: 1px solid #eee; cursor:default;">Platzhalter, noch keine Funktionalität</small>
				</li>
				<li><a href="#" class="match-template-button" data-template="motor-inf">Motor-Inf</a></li>
				<li><a href="#" class="match-template-button" data-template="mech-inf">Mech-Inf</a></li>
				<li><a href="#" class="match-template-button" data-template="mbt">Kpz</a></li>
				<li><a href="#" class="match-template-button" data-template="mbt">...</a></li>
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
				<li>
				<small style="display: block; padding: 10px; border-bottom: 1px solid #eee; cursor:default;">Einfügen bei Trupps, Zügen oder Kompanien. Code: <span style="cursor:default; padding: 5px; background-color: #f0f0f0; display: block;">natosymbol=""</small>
				</li>
				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="inf" data-skip="true">
				<div class="natosymbol symbol_inf symbol_small"></div>Infanterie</a>
				</li>

				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="motor_inf" data-skip="true">
				<div class="natosymbol symbol_motor_inf symbol_small"></div>Motorisierte Infanterie</a>
				</li>

				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="mech_inf" data-skip="true">
				<div class="natosymbol symbol_mech_inf symbol_small"></div>Mechanisierte Infanterie</a>
				</li>

				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="recon" data-skip="true">
				<div class="natosymbol symbol_recon symbol_small"></div>Recon</a>
				</li>

				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="mortar" data-skip="true">
				<div class="natosymbol symbol_mortar symbol_small"></div>Mörser</a>
				</li>

				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="art" data-skip="true">
				<div class="natosymbol symbol_art symbol_small"></div>Artillerie</a>
				</li>

				<li>
				<a href="#" class="match-template-button" data-template="empty" data-included="armor" data-skip="true">
				<div class="natosymbol symbol_armor symbol_small"></div>Panzer</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="air" data-skip="true">
				<div class="natosymbol symbol_air symbol_small"></div>Helikopter</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="plane" data-skip="true">
				<div class="natosymbol symbol_plane symbol_small"></div>Flugzeug</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="uav" data-skip="true">
				<div class="natosymbol symbol_uav symbol_small"></div>Drohne</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="hq" data-skip="true">
				<div class="natosymbol symbol_hq symbol_small"></div>HQ</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="med" data-skip="true"><div class="natosymbol symbol_med symbol_small"></div>Sanitäter</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="maint" data-skip="true">
				<div class="natosymbol symbol_maint symbol_small"></div>Reparatur</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="service" data-skip="true">
				<div class="natosymbol symbol_service symbol_small"></div>Logistik</a>
				</li>

				<li><a href="#" class="match-template-button" data-template="empty" data-included="support" data-skip="true">
				<div class="natosymbol symbol_support symbol_small"></div>Support</a>
				</li>
				
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
				<li>
				<small style="display: block; padding: 10px; border-bottom: 1px solid #eee; cursor:default;">Vollständige Missionstemplates für mehrmals gespielte Missionen. Eigene Formate bei Nomi einreichen.</small>
				</li>
				<li>
				<li><a href="#" class="match-template-button" data-template="mission_breakingcontact_40p" data-skip="true" data-clear="true">Breaking Contact</a></li>
				<li><a href="#" class="match-template-button" data-template="mission_urbanops" data-skip="true" data-clear="true">Urban Ops</a></li>
			</ul>
		</li>
	</ul>

	<form  data-tid="{tid}" id="match-definition-form">
		<textarea id="match-definition"><match></match></textarea>
	</form>
	<script>
		window.matchString1 = "<match>";
		window.matchString2 = "</match>";
	</script>
</div>
