<div class="match-definition-container">

    <div class="match-definition-header">
        <span class="match-template-label">Slotliste freigeben</span>

        <a href="/topic/{tid}" id="match-cancel" class="btn btn-default composer-discard"><i class="fa fa-arrow-left"></i> Zurück</a>
    </div>

    <div class="match-template-settings">
        Per Clan im Reservation-for Attribut kann ein Slottinglink erstellt werden. Dieser ermöglicht externen Clans das Slotten in unserer Slotliste.
    </div>

    <!-- IF availableReservations.length -->
    <h2>Verfügbare Slottinglinks</h2>
    <!-- BEGIN availableReservations -->
    <div style="font-size: 14pt; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
        <div>
            <i class="fa fa-users" style="margin-right: 1rem"></i> {availableReservations}
        </div>
        <div>
            <button onclick="addSlotlink('{tid}', '{matchid}', '{availableReservations}')" style="margin-right: 1rem; background: transparent; border: 0;" title="Link hinzufügen">
                <i class="fa fa-plus"></i>
            </button>
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
            <button onclick="openSlotlink('{tid}', '{matchid}', '{activeReservations.adminUuid}', '{activeReservations.reservation}')" style="margin-right: 1rem; background: transparent; border: 0;"><i class="fa fa-external-link"></i></button>
            <button onclick="deleteSlotlink('{tid}', '{matchid}', '{activeReservations.reservation}')" style="margin-right: 1rem; background: transparent; border: 0;"><i class="fa fa-trash-o"></i></button>
        </div>
    </div>
    <!-- END activeReservations -->
    <!-- ENDIF -->

    <script>
        var blockRequest = false;

        const addSlotlink = function(tid, matchid, reservation) {
            if (blockRequest)
                return;

            blockRequest = true;
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/arma3-slotting/' + tid + '/match/' + matchid + '/share', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    location.reload();
                }
            };
            xhr.send(JSON.stringify({reservation: reservation}));
        };

        const deleteSlotlink = function(tid, matchid, reservation) {
            if (blockRequest)
                return;

            blockRequest = true;
            const xhr = new XMLHttpRequest();
            xhr.open('DELETE', '/api/arma3-slotting/' + tid + '/match/' + matchid + '/share', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    location.reload();
                }
            };
            xhr.send(JSON.stringify({reservation: reservation}));
        };

        const openSlotlink = function(tid, matchid, adminUuid, reservation) {
            window.open('//localhost:4200/events?tid=' + tid + '&matchid=' + matchid + '&uuid=' + adminUuid + '&reservation=' + reservation,'_blank');
        }
    </script>
</div>
