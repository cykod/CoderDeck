CoderDeck
=========
Create interactive live-coding presentations for the web.

CoderDeck combines Deck.js with the CodeMirror2 highlighting code editor to 
make it easy to demo and teach live HTML, CSS and Javascript directly in the browser.



CoderDeck is Copyright (c)2011 Cykod LLC

Deck.js, CodeMirror2, jQuery et al are (c) their respective owners.


Building your own Decks
==================
Download the pre-built package which includes a index.html file and all required resources in the dist/ directory:

https://github.com/downloads/cykod/CoderDeck/CoderDeck-0.0.4.tar.gz

Edit the index.html file (don't forget the title tag) to build your presentation.

Building from scratch
===================
CoderDeck requires node.js to build, concatenate and uglify everything up.

Run `make` to install the submodules of deck.js and codermirror2 and uglify and minify everything into the dist directory,
it will then make a version-numbered tarball you can untar somewhere and use as a starting point for your own presentation.

`coderdeck.css` is an optional theme made for coderdeck - you can use try other deck.js themes (let us know how they work)


Contributors
============

[marcneuwirth](https://github.com/marcneuwirth) added Gist support.
