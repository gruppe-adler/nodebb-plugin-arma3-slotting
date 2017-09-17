define(
    "arma3-slotting/expandUnitTree",
    ["underscore"],
    function(_) {

        var subUnitCategories = ['company', 'platoon', 'squad', 'fireteam', 'slot'];
        var RESERVATION_KEY = 'reserved-for';
        var MIN_SLOTTED_PLAYER_COUNT_KEY = 'min-slotted-player-count';

        function propagateInheritables(unit, totalSlotted) {
            var reservation = unit[RESERVATION_KEY];
            var minSlottedPlayerCount = unit[MIN_SLOTTED_PLAYER_COUNT_KEY];

            subUnitCategories.forEach(function (subUnitCategory) {
                unit[subUnitCategory] && unit[subUnitCategory].forEach(function (subUnit) {
                    //only add reservation to subunit if it has not defined its own reservation!
                    subUnit[RESERVATION_KEY] = subUnit[RESERVATION_KEY] || reservation;
                    subUnit[MIN_SLOTTED_PLAYER_COUNT_KEY] = subUnit[MIN_SLOTTED_PLAYER_COUNT_KEY] || minSlottedPlayerCount;

                    propagateInheritables(subUnit, totalSlotted);
                });
            });
            unit.slot && unit.slot.forEach(function (slot) {
                slot.minSlottedPlayerCountFulfilled = (slot[MIN_SLOTTED_PLAYER_COUNT_KEY] || 0) <= totalSlotted;
            });
        }

        /**
         * the match object received from server can have reservations defined for higher-ranking units without having them defined for the single slots.
         * this functions adds reservations to every single dependendent slot for reservations. example:
         *    squad[reserved-for=Adler]
         *       slot
         *       slot
         *       slot
         *          reservation: 3CB
         *
         *  ==>
         *
         *
         *    squad[reserved-for=Adler]
         *      slot
         *          reservation: Adler
         *      slot
         *          reservation: Adler
         *      slot
         *          reservation: 3CB
         *      slot
         *          reservation: Adler
         */
        return function (match) {
            // expandChildrenToArrays(match);
            propagateInheritables(match, match.slottedPlayerCount);
            return match;
        };
    }
);
