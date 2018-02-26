$(function() {

    // fill table
    browser.storage.local.get('listSecrets').then(function(item) {
        var SAuthButtonDelete = browser.i18n.getMessage('SAuthButtonDelete');
        $.each(item.listSecrets, function( key, value ) {
            var tmpRow = '<tr><td>' + parseInt(key + 1) + '</td><td>' + value.account + '</td><td>************</td><td class="text-danger text-right"><button class="btn btn-danger delete"></button></td></tr>';
            $('#list-secrets tbody').append(tmpRow);
        });
        $('.delete').html(SAuthButtonDelete).on('click', function(){
            deleteSecret($(this).closest('tr'));
        });
    });

    // add localization i18n items
    var SAuthLabelSecurity = browser.i18n.getMessage('SAuthLabelSecurity');
    var SAuthLabelPIN = browser.i18n.getMessage('SAuthLabelPIN');
    var SAuthButtonSave = browser.i18n.getMessage('SAuthButtonSave');
    var SAuthLabelListSecrets = browser.i18n.getMessage('SAuthLabelListSecrets');
    var SAuthLabelPINOld = browser.i18n.getMessage('SAuthLabelPINOld');
    var SAuthLabelPINNew = browser.i18n.getMessage('SAuthLabelPINNew');
    var SAuthLabelSecretAccount = browser.i18n.getMessage('SAuthLabelSecretAccount');
    var SAuthLabelSecretCode = browser.i18n.getMessage('SAuthLabelSecretCode');
    var SAuthLabelData = browser.i18n.getMessage('SAuthLabelData');
    var SAuthButtonAdd = browser.i18n.getMessage('SAuthButtonAdd');
    var SAuthButtonReset = browser.i18n.getMessage('SAuthButtonReset');

    $('#security').html(SAuthLabelSecurity);
    $('#label-pin').html(SAuthLabelPIN);
    $('.save').html(SAuthButtonSave);
    $('#secrets').html(SAuthLabelListSecrets);
    $('#label-pin-old').html(SAuthLabelPINOld);
    $('#label-pin-new').html(SAuthLabelPINNew);
    $('#label-secret-account, .label-secret-account').html(SAuthLabelSecretAccount);
    $('#label-secret-code, .label-secret-code').html(SAuthLabelSecretCode);
    $('#data').html(SAuthLabelData);
    $('#add').html(SAuthButtonAdd);
    $('#reset').html(SAuthButtonReset);

    // create & update pin code
    browser.storage.local.get('pin').then(function(item) {
        // create
        if (item.pin == undefined) {

            $('#form-options-pin-create').show();
            $('#form-options-pin-update').hide();
            $('#main-forms').hide();

            // create PIN
            $('#form-options-pin-create').submit(function(event) {
                var tmpPin = $('#sauth-pin').val();
                if (tmpPin.length === 4) {
                    browser.storage.local.set({ pin: tmpPin });
                    $('#form-options-pin-create').hide();
                    $('#form-options-pin-update').show();
                    $('#main-forms').show();
                } else {
                    alert(browser.i18n.getMessage('SAuthAlertForm'));
                }
                event.preventDefault();
            });

        // update
        } else {

            $('#form-options-pin-create').hide();
            $('#form-options-pin-update').show();
            $('#main-forms').show();

            // update PIN
            $('#form-options-pin-update').submit(function(event) {
                var tmpPinOld = $('#sauth-pin-old').val();
                var tmpPinNew = $('#sauth-pin-new').val();
                if ((tmpPinNew.length === 4) && (item.pin == tmpPinOld)) {
                    browser.storage.local.set({ pin: tmpPinNew });
                    $('#sauth-pin-old').val('');
                    $('#sauth-pin-new').val('');
                    alert(browser.i18n.getMessage('SAuthAlertFormPinSuccess'));
                } else {
                    alert(browser.i18n.getMessage('SAuthAlertForm'));
                }
                event.preventDefault();
            });

        }
    });

    // create secret
    $('#form-options-secrets').submit(function(event) {
        browser.storage.local.get('listSecrets').then(function(item) {
            var SAuthButtonDelete = browser.i18n.getMessage('SAuthButtonDelete');
            if (item.listSecrets != undefined) {
                var listSecrets = item.listSecrets;
            } else {
                var listSecrets = [];
            }
            var tmpAccount = $('#sauth-secret-account').val();
            var tmpCode = $('#sauth-secret-code').val();
            if (($.trim(tmpAccount) != '') && ($.trim(tmpCode) != '')) {
                var tmpSecret = { account: tmpAccount, code: tmpCode };
                listSecrets.push(tmpSecret);
                // save form
                browser.storage.local.set({ listSecrets: listSecrets });
                // update table
                $('#list-secrets  tbody').html('');
                $.each(listSecrets, function( key, value ) {
                    var tmpRow = '<tr><td>' + parseInt(key + 1) + '</td><td>' + value.account + '</td><td>************</td><td class="text-danger text-right"><button class="btn btn-danger delete"></button></td></tr>';
                    $('#list-secrets tbody').append(tmpRow);
                });
                $('.delete').html(SAuthButtonDelete).on('click', function(){
                    deleteSecret($(this).closest('tr'));
                });
                // empty form
                $('#sauth-secret-account').val('');
                $('#sauth-secret-code').val('');
            } else {
                alert(browser.i18n.getMessage('SAuthAlertForm'));
            }
        });
        event.preventDefault();
    });

    // delete secret
    function deleteSecret(rowSecret) {
        if (confirm(browser.i18n.getMessage('SAuthConfirmDelete'))) {
            browser.storage.local.get('listSecrets').then(function(item) {
                var SAuthButtonDelete = browser.i18n.getMessage('SAuthButtonDelete');
                var tmpAccount = $(rowSecret[0].childNodes[1]).html();
                var tmpCode = $(rowSecret[0].childNodes[2]).html();
                var newListSecrets = $.grep(item.listSecrets, function( n, i ) {
                    var tmpSupp = { account: tmpAccount, code: tmpCode };
                    return n.code != tmpSupp.code;
                });
                // save
                browser.storage.local.set({ listSecrets: newListSecrets });
                // update table
                $('#list-secrets  tbody').html('');
                $.each(newListSecrets, function( key, value ) {
                    var tmpRow = '<tr><td>' + parseInt(key + 1) + '</td><td>' + value.account + '</td><td>************</td><td class="text-danger text-right"><button class="btn btn-danger delete"></button></td></tr>';
                    $('#list-secrets tbody').append(tmpRow);
                });
                $('.delete').html(SAuthButtonDelete).on('click', function(){
                    deleteSecret($(this).closest('tr'));
                });
            });
        }
    };

    // reset all data
    $('#form-options-data').submit(function(event) {
        if (confirm(browser.i18n.getMessage('SAuthConfirmReset'))) {
            browser.storage.local.remove(['pin', 'listSecrets', 'sessionDate']).then(function(item) {
                browser.runtime.openOptionsPage();
            });
        }
    });

});
