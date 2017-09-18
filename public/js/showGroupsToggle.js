define('arma3-slotting/showGroupsToggle', ['async', 'underscore'], function () {

    var switchId = 'input_arma3-slotting-show-group-color';
    var getSwitch = function () {
        return document.querySelector('#' + switchId);
    };
    function updateShowGroupColor(state) {
        if (state) {
            $('.slot .slot_descr.plain').hide();
            $('.slot .slot_descr.group-color').show();
        } else {
            $('.slot .slot_descr.plain').show();
            $('.slot .slot_descr.group-color').hide();
        }
    }

    return {
        getToggleMarkup: function () {
            return '<label class="switch">' +
                '<input type="checkbox" id="' + switchId + '">' +
                '<div class="slider round"></div>' +
                '<div class="switch_label">Gruppenfarbe zeigen</div>' +
                '</label>';
        },
        init: function () {
            var toggle = getSwitch();
            toggle.addEventListener('change', function () {
                var state = this.checked;
                updateShowGroupColor(state);
                localStorage.setItem('pluginArma3Slotting:showGroupColor', JSON.stringify(state));
            });

            var initialState = false;
            try {
                initialState = JSON.parse(localStorage.getItem('pluginArma3Slotting:showGroupColor'));
            } catch (e) {
                console.debug(e);
            }
            toggle.checked = initialState;
            updateShowGroupColor(initialState);
        }
    }
});

/*

                insertSlotlistsNode(matchesFragment);
                var showGroupColorCheckbox = document.querySelector('#input_arma3-slotting-show-group-color');
                // showGroupColorCheckbox.checked = getInitialGroupColorCheckboxState();
                setShowGroupColor(showGroupColorCheckbox);
            }
        );
    }

    function getEventControlsMarkup() {
        return
    }


 */
