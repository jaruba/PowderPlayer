var fs = require('fs');

var registry = require('./registry');
var fonts = require('./fonts');
var font = require('font');


function suitableFonts(){
	return fonts.getNames().TrueType.filter(function(s){ return !/ita|oblique/i.test(s) });
}

function addFont(name){
	var confonts = consoleFonts();
	var key = '';
	while ((key += String('0')) in confonts);
	return consoleFonts().add(key, name);
}

function consoleFonts(){
	var cached = registry('HKLM/Software/Microsoft/Windows NT/CurrentVersion/Console/TrueTypeFont');
	consoleFonts = function consoleFonts(){ return cached };
	return cached;
}


//fs.writeFileSync('fontinfo.js', require('util').inspect(x, null, 6))
//console.log(font.listFonts().filter(function(s){ return /mono/i.test(s) && !/ita|oblique/i.test(s) }))
console.log(suitableFonts());
//console.log(font.loadFont('DejaVuSans.ttf'))
/*
'DejaVuSans-Bold.ttf',
  'DejaVuSans-BoldOblique.ttf',
  'DejaVuSans-ExtraLight.ttf',
  'DejaVuSans-Oblique.ttf',
  'DejaVuSans.ttf',
  'DejaVuSansCondensed-Bold.ttf',
  'DejaVuSansCondensed-BoldOblique.ttf',
  'DejaVuSansCondensed-Oblique.ttf',
  'DejaVuSansCondensed.ttf',
  'DejaVuSansMono-Bold.ttf',
  'DejaVuSansMono-BoldOblique.ttf',
  'DejaVuSansMono-Oblique.ttf',
  'DejaVuSansMono.ttf',
  'DejaVuSansMonoCond.ttf',
  'DejaVuSansMonoExtraCond.ttf',
  'DejaVuSansMono_0.ttf',
  'DejaVuSerif-Bold.ttf',
  'DejaVuSerif-BoldItalic.ttf',
  'DejaVuSerif-Italic.ttf',
  'DejaVuSerif.ttf',
  'DejaVuSerifCondensed-Bold.ttf',
  'DejaVuSerifCondensed-BoldItalic.ttf',
  'DejaVuSerifCondensed-Italic.ttf',
  'DejaVuSerifCondensed.ttf',*/


//consoleFonts()["TheSansMono-Light"].remove();
//console.log(addFont("Lucida Console"));
//suitableFonts().filter(function(s){ return !/bold|cond/i.test(s) }).map(addFont)

// var confonts = consoleFonts();

// Object.keys(confonts).forEach(function(s, i){
// 	confonts[s].remove();
// 	confonts.add(Array(i+2).join('0'), s);
// });

// console.log(registry('HKLM/Software/Microsoft/Windows/CurrentVersion'));

// setTimeout(process.exit.bind(process), 50);



// The font must be a fixed-pitch font.
// The font cannot be an italic font.
// The font cannot have a negative A or C space.
// If it is a TrueType font, it must be FF_MODERN.
// If it is not a TrueType font, it must be OEM_CHARSET.