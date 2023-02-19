//*****************************************************************************
// Simple TOC Parse Example
// © 2018
// Jeff Buehler
//*****************************************************************************

var fs = require('fs');

var file = process.argv[2];

// remove trailing slash if there is one from the path
if (file.substr(-1) == '/') {
    file = file.substr(0, file.length - 1);
}
var os = require('os');
var osplat = os.platform();
console.log('[*] Running on: ' + osplat);

var appDir = process.cwd(); // does not have trailing slash

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var doc = fs.readFileSync(file, 'utf8');

var output = new dom().parseFromString(doc);
var csvOut = '';

var title = xpath.select("//title/text()", output).toString();
var isbn = xpath.select("/head/comment()", output).toString();
isbn = isbn.replace(/<!-- Book ISBN: /g, '').replace(/-->| -->/g, '');

console.log('[BOOK-TITLE:' + title +']');
console.log('[BOOK-ISBN:' + isbn +']');

var navs = xpath.select("//nav", output);
if (!navs[0]) {
    console.log('[ERROR] This TOC has no nav elements - cannot proceed.')
}

// pass each nav element in toc as a block to be parsed out by parseNav
for (var j = 0, len = navs.length; j < len; j++) {
    var nv = navs[j].toString();
    nv = nv.replace(/<b>/ig, '').replace(/<\/b>/ig, '').replace(/<i>/ig, '').replace(/<\/i>/ig, '');
    parseNav(nv);
}

function parseNav(nav) {
    var op = new dom().parseFromString(nav);
    var nv = nav.match(/<nav([^>]*)/ig);
    console.log('[*] Collecting information for nav: ' + nv[0]);

    var nesting = xpath.select("//a", op);
    for (var i = 0, len = nesting.length; i < len; i++) {
        var level = 0;
        var nstr = nesting[i].toString();
        console.log('[*] ' + nstr);

        level = getNestLevel(nesting[i], 'nav');
        if (level === -1) {
            console.log('    [ERROR] This node has no nav parent element.');
        }
        //level = Math.floor(level * .5);

        console.log('    level: ' + level);
        var content = nesting[i].firstChild.data;
        console.log('    content: ' + content);
        var href = nesting[i].getAttribute('href');
        console.log('    href: ' + href);
    }
    return;
}

function getNestLevel(element, top) {
    var level = 0;
    var finLevel = 0;

    while (element.parentNode) {
        level++;
        if (level >= 2) {
            finLevel++;
            level = 0;
        }
        element = element.parentNode;
        if (element.tagName === top)
            return finLevel;
    }
    return -1;
}

//*****************************************************************************
