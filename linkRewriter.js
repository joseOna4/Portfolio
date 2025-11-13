document.addEventListener('DOMContentLoaded', function() {
    var linkMap = {
        'P1/p1.html': 'chips-ahoy',
        'P2/p2.html': 'tadanori-yokoo',
        'P3/p3.html': 'lista-roja',
        'P4/p4.html': 'tttyg',
        'P5/p5.html': 'la-grieta',
        'P6/p6.html': 'revuelta',
        'P7/p7.html': 'ilustraciones'
    };
    
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href');
        if (linkMap[href]) {
            links[i].setAttribute('href', linkMap[href]);
        }
    }
});
