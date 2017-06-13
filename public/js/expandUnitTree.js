define(
    "arma3-slotting/expandUnitTree",
    ["underscore"],
    function(_) {

        var subUnitCategories = ['company', 'platoon', 'squad', 'fireteam', 'slot'];
        var RESERVATION_KEY = 'reserved-for';

        function addReservationsToSubUnits(unit) {
            var reservation = unit[RESERVATION_KEY];

console.log('adding reservations…');
            subUnitCategories.forEach(function (subUnitCategory) {
                unit[subUnitCategory].forEach(function (subUnit) {
                    //only add reservation to subunit if it has not defined its own reservation!
                    subUnit[RESERVATION_KEY] = subUnit[RESERVATION_KEY] || reservation;
                    addReservationsToSubUnits(subUnit);
                });
            });
            unit.slot.forEach(function (slot) {
                if (!slot.reservation) {
                    slot.reservation = reservation;
                }
            });
        }

        function expandChildrenToArrays(unit) {
            // ensure we have *arrays* for subunits
            // undefined => [], subUnit => [subUnit], [subUnit] => [subUnit]
            subUnitCategories.forEach(function (subUnitCategory) {
                unit[subUnitCategory] = [].concat(unit[subUnitCategory] || []);
                unit[subUnitCategory].forEach(expandChildrenToArrays);
            });
        }

        function walkUnitTree(unit) {
            expandChildrenToArrays(unit);
            addReservationsToSubUnits(unit);
            console.log(unit);
            return unit;
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
            return walkUnitTree(match);
        };
    }
);
