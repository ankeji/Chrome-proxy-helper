// Chrome Proxy helper
// popup.js
// https://raw.github.com/henices/Chrome-proxy-helper/master/javascripts/popup.js

/**
 * @fileoverview
 *
 * @author: zhouzhenster@gmail.com
 */

var proxySetting = JSON.parse(localStorage.proxySetting);
var proxyRule = proxySetting['proxy_rule'];
var bypasslist = proxySetting['bypasslist'];
var socksHost = proxySetting['socks_host'];
var socksPort = proxySetting['socks_port'];
var socksType = proxySetting['socks_type'];
var httpHost = proxySetting['http_host'];
var httpPort = proxySetting['http_port'];
var httpsHost = proxySetting['https_host'];
var httpsPort = proxySetting['https_port'];
var pacType = proxySetting['pac_type'];
var pacScriptUrl = proxySetting['pac_script_url'];
var quicHost = proxySetting['quic_host'];
var quicPort = proxySetting['quic_port'];
var chinaList = JSON.parse(localStorage.chinaList);

if (proxySetting['internal'] == 'china') {
    bypasslist = chinaList.concat(bypasslist.split(','));
} else
    bypasslist = bypasslist ? bypasslist.split(',') : ['<local>'];


/**
 * set help message for popup page
 *
 */
function add_li_title() {
    var _http, _https, _socks, _pac, _quic;

    if (httpHost && httpPort) {
        _http = 'http://' + httpHost + ':' + httpPort;
        $('#http-proxy').attr('title', _http);
    }
    if (pacScriptUrl) {
        var type = pacType.split(':')[0];
        _pac = pacType + pacScriptUrl[type];
        $('#pac-script').attr('title', _pac);
    }
    if (httpsHost && httpsPort) {
        _https = 'https://' + httpsHost + ':' + httpsPort;
        $('#https-proxy').attr('title', _https);
    }
    if (socksHost && socksPort) {
        _socks = socksType + '://' + socksHost + ':' + socksPort;
        $('#socks5-proxy').attr('title', _socks);
    }
    if (quicHost && quicPort) {
        _quic = 'quic://' + quicHost + ':' + quicPort;
    }
}

/**
 * set popup page item blue color
 *
 */
function color_proxy_item() {
    var mode, rules, proxyRule, scheme;

    chrome.proxy.settings.get({ 'incognito': false },
        function (config) {
            //console.log(JSON.stringify(config));
            mode = config['value']['mode'];
            rules = config['value']['rules'];

            if (rules) {
                if (rules.hasOwnProperty('singleProxy')) {
                    proxyRule = 'singleProxy';
                } else if (rules.hasOwnProperty('proxyForHttp')) {
                    proxyRule = 'proxyForHttp';
                } else if (rules.hasOwnProperty('proxyForHttps')) {
                    proxyRule = 'proxyForHttps'
                } else if (rules.hasOwnProperty('proxyForFtp')) {
                    proxyRule = 'proxyForFtp';
                } else if (rules.hasOwnProperty('fallbackProxy')) {
                    proxyRule = 'fallbackProxy';
                }

            }

            if (mode == 'system') {
                $('#sys-proxy').addClass('selected');
            } else if (mode == 'direct') {
                $('#direct-proxy').addClass('selected');
            } else if (mode == 'pac_script') {
                $('#pac-script').addClass('selected');
            } else if (mode == 'auto_detect') {
                $('#auto-detect').addClass('selected');
            } else {
                scheme = rules[proxyRule]['scheme'];

                if (scheme == 'http') {
                    $('#http-proxy').addClass('selected');
                } else if (scheme == 'https') {
                    $('#https-proxy').addClass('selected');
                } else if (scheme == 'socks5') {
                    $('#socks5-proxy').addClass('selected');
                } else if (scheme == 'socks4') {
                    $('#socks5-proxy').addClass('selected');
                } else if (scheme == 'quic') {
                    $('#quic-proxy').addClass('selected');
                }
            }
        });
}

/**
 * set the icon on or off
 *
 */
function iconSet(str) {

    var icon = {
        path: 'images/on.png',
    }
    if (str == 'off') {
        icon['path'] = 'images/off.png';
    }
    chrome.browserAction.setIcon(icon);
}

function proxySelected(str) {
    var id = '#' + str;
    $('li').removeClass('selected');
    $(id).addClass('selected');
}

/**
 * set pac script proxy
 *
 */
function pacProxy() {

    var config = {
        mode: 'pac_script',
        pacScript: {
        },
    };

    var type = pacType.split(':')[0];
    config['pacScript']['url'] = pacType + pacScriptUrl[type];

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('on');
    proxySelected('pac-script');
    localStorage.proxyInfo = 'pac_url';
}

/**
 * set socks proxy (socks4 or socks5)
 *
 */
function socks5Proxy() {

    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        }
    };

    if (!socksHost) return;

    config['rules'][proxyRule] = {
        scheme: socksType,
        host: socksHost,
        port: parseInt(socksPort)
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('on');
    proxySelected('socks5-proxy');
    localStorage.proxyInfo = 'socks5';
}



/**
 * set http proxy
 *
 */
function httpProxy() {

    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        },
    };

    if (!httpHost) return;

    if (proxyRule == 'fallbackProxy')
        proxyRule = 'singleProxy';

    config['rules'][proxyRule] = {
        scheme: 'http',
        host: httpHost,
        port: parseInt(httpPort)
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('on');
    proxySelected('http-proxy');
    localStorage.proxyInfo = 'http';
}

/**
 * set https proxy
 *
 */
function httpsProxy() {

    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        }
    };

    if (!httpsHost) return;

    config['rules'][proxyRule] = {
        scheme: 'https',
        host: httpsHost,
        port: parseInt(httpsPort)
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('on');
    proxySelected('https-proxy');
    localStorage.proxyInfo = 'https';
}

function quicProxy() {

    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        }
    };

    if (!quicHost) return;

    config['rules'][proxyRule] = {
        scheme: 'quic',
        host: quicHost,
        port: parseInt(quicPort)
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('on');
    proxySelected('quic-proxy');
    localStorage.proxyInfo = 'quic';
}

/**
 * set direct proxy
 *
 */
function directProxy() {

    var config = {
        mode: 'direct',
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('off');
    proxySelected('direct-proxy');
    localStorage.proxyInfo = 'direct';
}

/**
 * set system proxy
 *
 */
function sysProxy() {

    var config = {
        mode: 'system',
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('off');
    proxySelected('sys-proxy')
    localStorage.proxyInfo = 'system';
}

/**
 * set auto detect proxy
 *
 */
function autoProxy() {

    var config = {
        mode: 'auto_detect',
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        function () { });

    iconSet('on');
    proxySelected('auto-detect')
    localStorage.proxyInfo = 'auto_detect';
}


chrome.proxy.onProxyError.addListener(function (details) {
    console.log(details.error);
});
function gotoPage(url) {
    var fulurl = chrome.extension.getURL(url);
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
        for (var i in tabs) {
            tab = tabs[i];
            if (tab.url == fulurl) {
                chrome.tabs.update(tab.id, { selected: true });
                return;
            }
        }
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.create({ url: url, index: tab.index + 1 });
        });
    });
}
function shuaxin() {
    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        },
    };
    chrome.proxy.settings.set(
        {
            value: {
                mode: 'direct',
            }, scope: 'regular'
        },
        function () {
        });

    // var url = "http://172.16.5.240:8000/ip";
    var url = localStorage.ip_api
    if (url) {
        $.get(url, function (data) {
            var myproxy = data.split(':')
            proxyRule = 'singleProxy';
            config['rules'][proxyRule] = {
                scheme: 'http',
                host: myproxy[0],
                port: parseInt(myproxy[1])
            };

            chrome.proxy.settings.set(
                { value: config, scope: 'regular' },
                function () { });

            iconSet('on');
            proxySelected('direct-shuaxin');
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
            localStorage.proxyInfo = 'http';

        })
    }else{
        var tipmsg = JSON.stringify('请前往设置ip池地址')
        gotoPage('options.html');
        alert(tipmsg)
    }
};


document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#pac-script').addEventListener('click', pacProxy);
    document.querySelector('#socks5-proxy').addEventListener('click', socks5Proxy);
    document.querySelector('#http-proxy').addEventListener('click', httpProxy);
    document.querySelector('#https-proxy').addEventListener('click', httpsProxy);
    document.querySelector('#quic-proxy').addEventListener('click', quicProxy);
    document.querySelector('#sys-proxy').addEventListener('click', sysProxy);
    document.querySelector('#direct-proxy').addEventListener('click', directProxy);
    document.querySelector('#direct-shuaxin').addEventListener('click', shuaxin);
    document.querySelector('#auto-detect').addEventListener('click', autoProxy);

    $('[data-i18n-content]').each(function () {
        var message = chrome.i18n.getMessage(this.getAttribute('data-i18n-content'));
        if (message)
            $(this).html(message);
    });

    if (!httpHost) {
        $('#http-proxy').hide();
    }

    if (!socksHost) {
        $('#socks5-proxy').hide();
    }

    if (!httpsHost) {
        $('#https-proxy').hide();
    }

    if (!pacScriptUrl) {
        $('#pac-script').hide();
    }

    if (!quicHost) {
        $('#quic-proxy').hide();
    }

});

$(document).ready(function () {
    color_proxy_item();
    add_li_title();
});
