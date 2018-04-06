$(function() {

    // update json (for new version)
    updateJSON();

    // update table
    browser.storage.local.get('listSecrets').then(function(item) {
        updateTable(item.listSecrets);
    });

    // update session
    browser.storage.local.get('sessionDuration').then(function(item) {
        var duration = item.sessionDuration;
        if (duration == undefined) {
            duration = 300;
        }
        $('#sauth-duration').val(duration);
    });

    // hide update form
    $('#form-options-secrets-update').hide();

    // add localization i18n items
    var SAuthLabelSecurity = browser.i18n.getMessage('SAuthLabelSecurity');
    var SAuthLabelPIN = browser.i18n.getMessage('SAuthLabelPIN');
    var SAuthButtonSave = browser.i18n.getMessage('SAuthButtonSave');
    var SAuthLabelListSecrets = browser.i18n.getMessage('SAuthLabelListSecrets');
    var SAuthLabelPINOld = browser.i18n.getMessage('SAuthLabelPINOld');
    var SAuthLabelPINNew = browser.i18n.getMessage('SAuthLabelPINNew');
    var SAuthLabelSecretAccount = browser.i18n.getMessage('SAuthLabelSecretAccount');
    var SAuthLabelSecretCode = browser.i18n.getMessage('SAuthLabelSecretCode');
    var SAuthLabelSession = browser.i18n.getMessage('SAuthLabelSession');
    var SAuthLabelDuration = browser.i18n.getMessage('SAuthLabelDuration');
    var SAuthLabelData = browser.i18n.getMessage('SAuthLabelData');
    var SAuthButtonAdd = browser.i18n.getMessage('SAuthButtonAdd');
    var SAuthButtonUpdate = browser.i18n.getMessage('SAuthButtonUpdate');
    var SAuthButtonCancel = browser.i18n.getMessage('SAuthButtonCancel');
    var SAuthButtonReset = browser.i18n.getMessage('SAuthButtonReset');
    var SAuthSeconds = browser.i18n.getMessage('SAuthSeconds');

    $('#security').html(SAuthLabelSecurity);
    $('#label-pin').html(SAuthLabelPIN);
    $('#label-pin-session').html(SAuthLabelPIN);
    $('.save').html(SAuthButtonSave);
    $('#secrets').html(SAuthLabelListSecrets);
    $('#label-pin-old').html(SAuthLabelPINOld);
    $('#label-pin-new').html(SAuthLabelPINNew);
    $('#label-secret-account, .label-secret-account, #label-secret-account-update').html(SAuthLabelSecretAccount);
    $('#label-secret-code, .label-secret-code').html(SAuthLabelSecretCode);
    $('#session').html(SAuthLabelSession);
    $('#label-duration').html(SAuthLabelDuration);
    $('#data').html(SAuthLabelData);
    $('#add').html(SAuthButtonAdd);
    $('#update').html(SAuthButtonUpdate);
    $('#cancel').html(SAuthButtonCancel);
    $('#reset').html(SAuthButtonReset);
    $('#label-seconds').html('(' + SAuthSeconds + ')');

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
                    browser.storage.local.remove(['pin', 'sessionDate']).then(function(itemDel) {
                        browser.storage.local.set({ pin: tmpPinNew });
                        $('#sauth-pin-old').val('');
                        $('#sauth-pin-new').val('');
                        alert(browser.i18n.getMessage('SAuthAlertFormPinSuccess'));
                    });
                } else {
                    alert(browser.i18n.getMessage('SAuthAlertForm'));
                }
                event.preventDefault();
            });

        }
    });

    // create secret
    $('#form-options-secrets-create').submit(function(event) {
        browser.storage.local.get('listSecrets').then(function(item) {
            if (item.listSecrets != undefined) {
                var listSecrets = item.listSecrets;
            } else {
                var listSecrets = [];
            }
            var tmpAccount = $('#sauth-secret-account').val();
            var SAuthCopy = browser.i18n.getMessage('SAuthCopy');
            $.each(item.listSecrets, function(i, value) {
                if (value.account == tmpAccount) {
                    tmpAccount = tmpAccount + ' - ' + SAuthCopy;
                }
            });
            var tmpCode = $('#sauth-secret-code').val();
            if (($.trim(tmpAccount) != '') && ($.trim(tmpCode) != '')) {
                var newId = 1;
                $.each(listSecrets, function( key, value ) {
                    newId = parseInt(value.id) + 1;
                });
                var tmpSecret = { id: newId, account: tmpAccount, code: tmpCode };
                listSecrets.push(tmpSecret);
                // save form
                browser.storage.local.set({ listSecrets: listSecrets });
                // update table
                updateTable(listSecrets);
                // empty form
                $('#sauth-secret-account').val('');
                $('#sauth-secret-code').val('');
            } else {
                alert(browser.i18n.getMessage('SAuthAlertForm'));
            }
        });
        event.preventDefault();
    });

    // update label account
    $('#form-options-secrets-update').submit(function(event) {

        browser.storage.local.get('listSecrets').then(function(item) {
            var tmpId = $('#sauth-secret-id-update').val();
            var tmpAccount = $('#sauth-secret-account-update').val();
            var SAuthCopy = browser.i18n.getMessage('SAuthCopy');
            $.each(item.listSecrets, function(i, value) {
                if (value.account == tmpAccount) {
                    tmpAccount = tmpAccount + ' - ' + SAuthCopy;
                }
            });
            var newListSecrets = [];
            var tmpSecret = {};
            $.each(item.listSecrets, function(i, value) {
                if (value.id != tmpId) {
                    tmpSecret = { id: value.id, account: value.account, code: value.code };
                } else {
                    tmpSecret = { id: value.id, account: tmpAccount, code: value.code };
                }
                newListSecrets.push(tmpSecret);
            });
            // save
            browser.storage.local.set({ listSecrets: newListSecrets });
            // update table
            updateTable(newListSecrets);
            // close update form
            cancelUpdate();
        });
        event.preventDefault();
    });

    // update duration
    $('#form-options-duration').submit(function(event) {
        var newDuration = $('#sauth-duration').val();
        var tmpPin = $('#sauth-pin-session').val();
        browser.storage.local.get('pin').then(function(item) {
            if ((newDuration >= 0) && (item.pin == tmpPin)) {
                browser.storage.local.set({ sessionDuration: newDuration });
                $('#sauth-pin-session').val('');
                alert(browser.i18n.getMessage('SAuthAlertFormDurationSuccess'));
            } else {
                $('#sauth-pin-session').val('');
                alert(browser.i18n.getMessage('SAuthAlertForm'));
            }
        });
        event.preventDefault();
    });

    // update json if necessary
    function updateJSON() {
        browser.storage.local.get('listSecrets').then(function(item) {
            var data = item.listSecrets;
            if (data != undefined) {
                // add ID
                if (data[0].id == undefined) {
                    var listSecrets = [];
                    $.each(data, function(i, value) {
                        var tmpSecret = { id: parseInt(i) + 1, account: value.account, code: value.code };
                        listSecrets.push(tmpSecret);
                    });
                    // save data
                    browser.storage.local.set({ listSecrets: listSecrets });
                }
            }
        });
    };

    // delete secret
    function deleteSecret(rowSecret) {
        if (confirm(browser.i18n.getMessage('SAuthConfirmDelete'))) {
            browser.storage.local.get('listSecrets').then(function(item) {
                var SAuthButtonDelete = browser.i18n.getMessage('SAuthButtonDelete');
                var SAuthButtonUpdate = browser.i18n.getMessage('SAuthButtonUpdate');
                var tmpId = $(rowSecret[0]).data('row');
                var newListSecrets = [];
                $.each(item.listSecrets, function(i, value) {
                    if (value.id != tmpId) {
                        var tmpSecret = { id: value.id, account: value.account, code: value.code };
                        newListSecrets.push(tmpSecret);
                    }
                });
                // save
                browser.storage.local.set({ listSecrets: newListSecrets });
                // update table
                updateTable(newListSecrets);
            });
        }
    };

    // update table
    function updateTable(listSecrets) {
        var SAuthButtonDelete = browser.i18n.getMessage('SAuthButtonDelete');
        var SAuthButtonUpdate = browser.i18n.getMessage('SAuthButtonUpdate');
        var SAuthButtonCancel = browser.i18n.getMessage('SAuthButtonCancel');
        $('#list-secrets tbody').html('');
        $.each(listSecrets, function( key, value ) {
            var tmpRow = '<tr data-row="' + value.id + '"><td>' + value.id + '</td><td>' + value.account + '</td><td>************</td><td class="text-right"><a class="text-primary update"><i class="fa fa-pencil"></i></a><a class="text-danger delete"><i class="fa fa-trash"></i></a></td></tr>';
            $('#list-secrets tbody').append(tmpRow);
        });
        $('.delete').attr('title', SAuthButtonDelete).on('click', function(){
            deleteSecret($(this).closest('tr'));
        });
        $('.update').attr('title', SAuthButtonUpdate).on('click', function(){
            updateSecret($(this).closest('tr'));
        });
        $('#cancel').attr('title', SAuthButtonCancel).on('click', function(){
            cancelUpdate();
        });
    }

    // update label secret
    function updateSecret(rowSecret) {
        var tmpId = $(rowSecret[0]).data('row');
        var tmpAccount = $(rowSecret[0].childNodes[1]).html();
        $('#sauth-secret-id-update').val(tmpId);
        $('#sauth-secret-account-update').val(tmpAccount);
        $('#form-options-secrets-create').hide();
        $('#form-options-secrets-update').show();
    };

    // cancel update label secret
    function cancelUpdate() {
        $('#sauth-secret-account-update').val('');
        $('#sauth-secret-id-update').val('');
        $('#form-options-secrets-update').hide();
        $('#form-options-secrets-create').show();
    }

    // reset all data
    $('#form-options-data').submit(function(event) {
        if (confirm(browser.i18n.getMessage('SAuthConfirmReset'))) {
            browser.storage.local.remove(['pin', 'listSecrets', 'sessionDate', 'sessionDuration']).then(function(item) {
                browser.runtime.openOptionsPage();
            });
        }
    });

});
