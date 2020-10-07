// update json if necessary
function updateJSON() {
    browser.storage.local.get('listSecrets').then(function (item) {
        let data = item.listSecrets;
        if (data != undefined) {

            // add ID
            if (data[0].id == undefined) {
                var listSecrets = [];
                $.each(data, function (i, value) {
                    var tmpSecret = { id: parseInt(i) + 1, account: value.account, code: value.code };
                    listSecrets.push(tmpSecret);
                });
                // save data
                browser.storage.local.set({ listSecrets: listSecrets });
            }

            // add issuer
            if (data[0].issuer == undefined) {
                var listSecrets = [];
                $.each(data, function (i, value) {
                    var tmpSecret = { id: value.id, issuer: '', account: value.account, code: value.code };
                    listSecrets.push(tmpSecret);
                });
                // save data
                browser.storage.local.set({ listSecrets: listSecrets });
            }

        }
    });
};

// timeLoop
function timeLoop() {
    var time = Math.floor(Date.now() / 1000);
    var loop = time % 30;
    var start = Math.round(((1 / 30) * loop) * 100) / 100;
    var duration = 30000 - (loop * 1000);
    // update height container
    $('.container-list').css({
        'height': '300px',
        'overflow-y': 'scroll',
        'overflow-x': 'hidden'
    });
    // animation circleProgress
    $('.circle').circleProgress({
        value: 1.0,
        size: 70,
        startAngle: 270 * Math.PI / 180,
        animationStartValue: start,
        emptyFill: 'rgba(0, 0, 0, .1)',
        animation: { duration: duration, easing: "linear" },
        fill: {
            color: '#0080FF'
        }
    }).off().on('circle-animation-end', function (e) {
        var tmpCode = $(this).parent().parent().find('.value').data('code');
        $(this).parent().parent().find('.value').html(otplib.authenticator.generate(tmpCode));
        $('.circle').circleProgress({
            animationStartValue: 0.0,
            animation: { duration: 30000, easing: "linear" }
        }, 'redraw');
    });
    // add copy event
    $('.secret-container').off().on('click', function () {
        navigator.clipboard.writeText($(this).find('.value').text()).then(function () {
            $('#success-copy').stop(true).css({ 'visibility': 'visible', 'opacity': 1.0 });
            $('#success-copy').delay(2500).animate({
                opacity: 0.0
            }, { duration: 1000 }, function () {
                $('#success-copy').css('visibility', 'hidden');
            });
        });
    });
}

$(function () {
    // update json (for new version)
    updateJSON();

    // add localization i18n items
    var SAuthClipboard = browser.i18n.getMessage('SAuthClipboard');

    $('#clipboard').html(SAuthClipboard);

    // add event to open params
    $('.params .fa-cog').on('click', function () {
        browser.runtime.openOptionsPage();
    });

    // add event to open GitHub repository
    $('.params .fa-github').on('click', function () {
        browser.tabs.create({
            url: 'https://github.com/Silbad/SAuth'
        });
    });

    // version
    var manifest = chrome.runtime.getManifest();
    $('.version').html(manifest.version);

    // show codes
    browser.storage.local.get(['pin', 'listSecrets', 'sessionDate', 'sessionDuration']).then(function (item) {

        // test code pin and if secret
        if ((item.pin != undefined) && (item.pin != '') && (item.listSecrets != undefined) && (item.listSecrets != '')) {

            // test session
            if (item.sessionDate != undefined) {
                // update session date
                var now = new Date();
                var tmpTime = item.sessionDate;
                var ecartSession = now.getTime() - tmpTime;
                var duration = item.sessionDuration;
                if (duration == undefined) {
                    duration = 300;
                }

                // test sessionDate and 5min session
                if (ecartSession > (duration * 1000)) {
                    $('.list-auth').append('<div class="d-flex align-items-center flex-column pin-login no-border"><label for="pin-session">' + browser.i18n.getMessage('SAuthLabelPIN') + '</label><input id="pin-session" class="form-control" type="password" maxlength="4" value="" /></div>');
                    $('#pin-session').off().on('keyup keypress blur change', function (e) {
                        if (($(this).val().length == 4) && ($(this).val() == item.pin)) {
                            var tmpNow = new Date();
                            browser.storage.local.set({ sessionDate: tmpNow.getTime() });
                            $('.pin-login').remove();
                            var tmpNb = 0;
                            $.each(item.listSecrets, function (key, value) {
                                var tmpSecret = '<div class="d-flex align-items-center p-2 secret-container"><div id="qrcode' + value.id + '" class="qrcode"></div><div class="secret"><div class="code"><span class="value" data-code="' + value.code + '">' + otplib.authenticator.generate(value.code) + '</span><br /><span class="text font-weight-bold">' + value.issuer + '</span><br /><span class="text">' + value.account + '</span></div></div><div class="clock"><div class="circle"></div></div></div>';
                                $('.list-auth').append(tmpSecret);
                                var typeNumber = 6;
                                var errorCorrectionLevel = 'L';
                                var qr = qrcode(typeNumber, errorCorrectionLevel);
                                qr.addData(encodeURI('otpauth://totp/' + value.issuer + ':' + value.account + '?secret=' + value.code) + '&issuer=' + value.issuer);
                                qr.make();
                                $('#qrcode' + value.id).html(qr.createImgTag());
                                tmpNb++;
                            });
                            // test if secret
                            if (tmpNb > 0) {
                                timeLoop();
                            } else {
                                $('.list-auth').append('<div class="d-flex align-items-center no-border">' + browser.i18n.getMessage('SAuthConfigurationText') + '</div>');
                            }
                        }
                    }).focus();

                } else {

                    var tmpNb = 0;
                    $.each(item.listSecrets, function (key, value) {
                        var tmpSecret = '<div class="d-flex align-items-center p-2 secret-container"><div id="qrcode' + value.id + '" class="qrcode"></div><div class="secret"><div class="code"><span class="value" data-code="' + value.code + '">' + otplib.authenticator.generate(value.code) + '</span><br /><span class="text font-weight-bold">' + value.issuer + '</span><br /><span class="text">' + value.account + '</span></div></div><div class="clock"><div class="circle"></div></div></div>';
                        $('.list-auth').append(tmpSecret);
                        var typeNumber = 6;
                        var errorCorrectionLevel = 'L';
                        var qr = qrcode(typeNumber, errorCorrectionLevel);
                        qr.addData(encodeURI('otpauth://totp/' + value.issuer + ':' + value.account + '?secret=' + value.code) + '&issuer=' + value.issuer);
                        qr.make();
                        $('#qrcode' + value.id).html(qr.createImgTag());
                        tmpNb++;
                    });
                    // test if secret
                    if (tmpNb > 0) {
                        timeLoop();
                    } else {
                        $('.list-auth').append('<div class="d-flex align-items-center no-border">' + browser.i18n.getMessage('SAuthConfigurationText') + '</div>');
                    }
                }

            } else {
                // create session date
                $('.list-auth').append('<div class="d-flex align-items-center flex-column pin-login no-border"><label for="pin-session">' + browser.i18n.getMessage('SAuthLabelPIN') + '</label><input id="pin-session" class="form-control" type="password" maxlength="4" value="" /></div>');
                $('#pin-session').off().on('keyup keypress blur change', function (e) {
                    if (($(this).val().length == 4) && ($(this).val() == item.pin)) {
                        var tmpNow = new Date();
                        browser.storage.local.set({ sessionDate: tmpNow.getTime() });
                        $('.pin-login').remove();
                        var tmpNb = 0;
                        $.each(item.listSecrets, function (key, value) {
                            var tmpSecret = '<div class="d-flex align-items-center p-2 secret-container"><div id="qrcode' + value.id + '" class="qrcode"></div><div class="secret"><div class="code"><span class="value" data-code="' + value.code + '">' + otplib.authenticator.generate(value.code) + '</span><br /><span class="text font-weight-bold">' + value.issuer + '</span><br /><span class="text">' + value.account + '</span></div></div><div class="clock"><div class="circle"></div></div></div>';
                            $('.list-auth').append(tmpSecret);
                            var typeNumber = 6;
                            var errorCorrectionLevel = 'L';
                            var qr = qrcode(typeNumber, errorCorrectionLevel);
                            qr.addData(encodeURI('otpauth://totp/' + value.issuer + ':' + value.account + '?secret=' + value.code) + '&issuer=' + value.issuer);
                            qr.make();
                            $('#qrcode' + value.id).html(qr.createImgTag());
                            tmpNb++;
                        });
                        // test if secret
                        if (tmpNb > 0) {
                            timeLoop();
                        } else {
                            $('.list-auth').append('<div class="d-flex align-items-center no-border">' + browser.i18n.getMessage('SAuthConfigurationText') + '</div>');
                        }
                    }
                }).focus();

            }

        } else {
            $('.list-auth').append('<div class="d-flex align-items-center no-border">' + browser.i18n.getMessage('SAuthConfigurationText') + '</div>');
        }
    });

});
