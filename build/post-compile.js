#!/usr/bin/env node

var print = require( "sys" ).print,
	fs = require( "fs" ),
	src = fs.readFileSync( process.argv[2], "utf8" ),
	version = fs.readFileSync( "version.txt", "utf8" ),
	// License Template
	license = fs.readFileSync("src/intro.js","utf8");


// Previously done in sed but reimplemented here due to portability issues
src = src.replace( /^(\s*\*\/)(.+)/m, "$1\n$2" ) + ";";

// Set minimal license block var
license = license.replace( "@VERSION", version );

// Replace license block with minimal license
src = src.replace( /\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//, license );

print( src );
