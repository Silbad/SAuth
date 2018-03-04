$(function() {

    // add localization i18n items
    var SAuthClipboard = browser.i18n.getMessage('SAuthClipboard');

    $('#clipboard').html(SAuthClipboard);

    // add event to open params
    $('.params .fa-cog').on('click', function(){
        browser.runtime.openOptionsPage();
    });

    // add event to open GitHub repository
    $('.params .fa-github').on('click', function(){
        browser.tabs.create({
            url: 'https://github.com/Silbad/SAuth'
        });
    });

    // version
    var manifest = chrome.runtime.getManifest();
    $('.version').html(manifest.version);

    // timeLoop
    function timeLoop() {
        var time = Math.floor(Date.now() / 1000);
        var loop = time % 30;
        var start = Math.round(((1 / 30) * loop) * 100) / 100;
        var duration = 30000 - (loop  * 1000);
        // update height container
        $('.container-list').css({
            'height': '264px',
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
        }).on('circle-animation-end', function(e) {
            var tmpCode = $(this).parent().parent().find('.value').data('code');
            $(this).parent().parent().find('.value').html(otplib.authenticator.generate(tmpCode));
            $('.circle').circleProgress({
                animationStartValue: 0.0,
                animation: { duration: 30000, easing: "linear" }
            }, 'redraw');
        });
        // add copy event
        $('.secret-container').on('click', function() {
            var tmpCopy = $(this).find('.value').text();
            $('#value-hidden').val(tmpCopy).select();
            document.execCommand('Copy');
            $('#success-copy').css({'visibility': 'visible', 'opacity': 1.0});
            var tmpSetTimeout = setTimeout(function(){
                $('#success-copy').animate({
                    opacity: 0.0
                }, 500, function() {
                    $('#success-copy').css('visibility', 'hidden');
                });
            }, 1000);
        });
    }

    // show codes
    browser.storage.local.get(['pin', 'listSecrets', 'sessionDate']).then(function(item) {

        // test code pin and if secret
        if ((item.pin != undefined) && (item.pin != '') && (item.listSecrets != undefined) && (item.listSecrets != '')) {

            // test session
            if ((item.sessionDate != undefined) && (item.sessionDate != undefined)) {
                // update session date
                var now = new Date();
                var tmpTime = item.sessionDate;
                var ecartSession = now.getTime() - tmpTime;

                // test sessionDate and 5min session
                if (ecartSession > 300000) {
                    $('.list-auth').append('<div class="d-flex align-items-center flex-column pin-login no-border"><label for="pin-session">' + browser.i18n.getMessage('SAuthLabelPIN') + '</label><input id="pin-session" class="form-control" type="password" maxlength="4" value="" /></div>');
                    $('#pin-session').off().on('keyup keypress blur change', function(e) {
                        if (($(this).val().length == 4) && ($(this).val() == item.pin)) {
                            var tmpNow = new Date();
                            browser.storage.local.set({ sessionDate: tmpNow.getTime() });
                            $('.pin-login').remove();
                            var tmpNb = 0;
                            $.each(item.listSecrets, function( key, value ) {
                                var tmpSecret = '<div class="d-flex align-items-center p-2"><div class="secret"><div class="code"><span class="value" data-code="' + value.code + '">' + otplib.authenticator.generate(value.code) + '</span><br /><span class="text">' + value.account + '</span></div></div><div class="clock"><div class="circle"></div></div></div>';
                                $('.list-auth').append(tmpSecret);
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
                    $.each(item.listSecrets, function( key, value ) {
                        var tmpSecret = '<div class="d-flex align-items-center p-2 secret-container"><div class="secret"><div class="code"><span class="value" data-code="' + value.code + '">' + otplib.authenticator.generate(value.code) + '</span><br /><span class="text">' + value.account + '</span></div></div><div class="clock"><div class="circle"></div></div></div>';
                        $('.list-auth').append(tmpSecret);
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
                $('#pin-session').off().on('keyup keypress blur change', function(e) {
                    if (($(this).val().length == 4) && ($(this).val() == item.pin)) {
                        var tmpNow = new Date();
                        browser.storage.local.set({ sessionDate: tmpNow.getTime() });
                        $('.pin-login').remove();
                        var tmpNb = 0;
                        $.each(item.listSecrets, function( key, value ) {
                            var tmpSecret = '<div class="d-flex align-items-center p-2 secret-container"><div class="secret"><div class="code"><span class="value" data-code="' + value.code + '">' + otplib.authenticator.generate(value.code) + '</span><br /><span class="text">' + value.account + '</span></div></div><div class="clock"><div class="circle"></div></div></div>';
                            $('.list-auth').append(tmpSecret);
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
