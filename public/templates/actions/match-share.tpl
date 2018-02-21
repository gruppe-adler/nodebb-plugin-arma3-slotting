<div class="match-definition-container">

    <div class="match-definition-header">
        <span class="match-template-label">Slotliste freigeben</span>

        <a href="/topic/{tid}" id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-arrow-left"></i> Zurück</a>
    </div>

    <div class="match-template-settings">
        Per Reservation-for Attribut kann ein Slottinglink erstellt werden. Dieser ermöglicht externen Clans das Slotten in unsere Slotliste.
    </div>

    <!-- IF availableReservations.length -->
    <h2>Verfügbare Slottinglinks</h2>
    <!-- BEGIN availableReservations -->
    <div style="font-size: 14pt; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
        <div>
            <i class="fa fa-users" style="margin-right: 1rem"></i> {availableReservations}
        </div>
        <div>
            <button onclick="addSlotlink('{tid}', '{matchid}', '{availableReservations}')" style="margin-right: 1rem; background: transparent; border: 0;"><i class="fa fa-plus"></i></button>
        </div>
    </div>
    <!-- END availableReservations -->
    <!-- ENDIF -->

    <!-- IF activeReservations.length -->
    <h2>Aktive Slottinglinks</h2>
    <!-- BEGIN activeReservations -->
    <div style="font-size: 14pt; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
        <div>
            <i class="fa fa-users" style="margin-right: 1rem"></i> {activeReservations.reservation}
        </div>
        <div>
            <button onclick="openSlotlink('{tid}', '{matchid}', '{activeReservations.uuid}')" style="margin-right: 1rem; background: transparent; border: 0;"><i class="fa fa-external-link"></i></button>
            <button onclick="deleteSlotlink('{tid}', '{matchid}', '{activeReservations.uuid}')" style="margin-right: 1rem; background: transparent; border: 0;"><i class="fa fa-trash-o"></i></button>
        </div>
    </div>
    <!-- END activeReservations -->
    <!-- ENDIF -->

    <script>
        const addSlotlink = function(tid, matchid, reservation) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/arma3-slotting/' + tid + '/match/' + matchid + '/share', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    location.reload();
                }
            };
            xhr.send(JSON.stringify({reservation: reservation}));
        };

        const deleteSlotlink = function(tid, matchid, uuid) {
            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', '/api/arma3-slotting/' + tid + '/match/' + matchid + '/share', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    location.reload();
                }
            };
            xhr.send(JSON.stringify({uuid: uuid}));
        };

        const openSlotlink = function(tid, matchid, uuid) {
            window.open('//gruppe-adler.de/events?tid=' + tid + '&matchid=' + matchid + '&uuid=' + uuid,'_blank');
        }
    </script>
</div>
