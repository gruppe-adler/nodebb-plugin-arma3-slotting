<div>
	<a href="/topic/{tid}/">back to event thread</a>
	<h1>{title}</h1>
	<div component="match/show" data-matchid="{matchid}" data-tid="{tid}" ></div>
	<div>
		<ul>
			<li>Slotted participants: <span id="slotted-participants"></span></li>
			<li></li>
		</ul>
	</div>
	<script>
		/*global require*/
		require([
			'arma3-slotting/getMatch',
			'arma3-slotting/renderMatch'
		], function (
			getMatch,
			renderMatch
		) {
			getMatch.callbacks.push(function (match) {
			});
			getMatch({tid}, '{matchid}', function (err, match) {
				renderMatch(match, {tid}, document.querySelector('[component="match/show"]'));
			});
		});
	</script>
</div>
