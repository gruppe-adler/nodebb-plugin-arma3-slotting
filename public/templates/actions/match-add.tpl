<div class="match-definition-container">
	<h2 class="match-h2">Slotliste XML: neues Match hinzufügen</h2>

	<form data-tid="{tid}">
		<button id="match-add-submit" class="btn btn-primary" type="submit"><i class="fa fa-check"></i> Match hinzufügen</button>
		<!-- <button id="match-dtd" class="btn btn-default">DTD anzeigen</button> -->
		<a href="/topic/{tid}" id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-times"></i> Abbrechen</a>

		<span class="match-template-label">Templates</span>
		<ul class="match-template-buttons">

			<li><button class="tag" data-template="breaking_contact"><span class="btn-text">Breaking Contact</span></button></li>
			<li><button class="tag" data-template="urban_ops"><span class="btn-text">Urban Ops</span></button></li>
			<li><button class="tag" data-template="Squad-9"><span class="btn-text">Squad-9</span></button></li>
			<li><button class="tag" data-template="Fireteam-5"><span class="btn-text">Fireteam-5</span></button></li>
			<li><button class="tag" data-template="Fireteam-4"><span class="btn-text">Fireteam-4</span></button></li>
		</ul>

		<textarea id="match-definition"></textarea>
	</form>
</div>
