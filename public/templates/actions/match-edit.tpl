<div class="match-definition-container">
	<span class="match-definition-debug pull-right">ID: {matchid}</span>
	<h2 class="match-h2">Slotliste XML</h2>
	<button id="match-submit" class="btn btn-primary"><i class="fa fa-check"></i> Speichern</button>
	<button id="match-dtd" class="btn btn-default">DTD anzeigen</button>
	<button id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-times"></i> Abbrechen</button>

	<span class="match-template-label">Templates</span>
	<ul class="match-template-buttons">
		
		<li><button class="tag" data-template="breaking_contact"><span class="btn-text">Breaking Contact</span></button></li>
		<li><button class="tag" data-template="urban_ops"><span class="btn-text">Urban Ops</span></button></li>
		<li><button class="tag" data-template="Squad-9"><span class="btn-text">Squad-9</span></button></li>
		<li><button class="tag" data-template="Fireteam-5"><span class="btn-text">Fireteam-5</span></button></li>
		<li><button class="tag" data-template="Fireteam-4"><span class="btn-text">Fireteam-4</span></button></li>
	</ul>
	<form data-matchid="{matchid}" data-tid="{tid}">
		
		<textarea id="match-definition">
		{spec}
		</textarea>
	</form>
	
</div>
