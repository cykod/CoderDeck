SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe
POST_COMPILER = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js

BASE_FILES = ${SRC_DIR}/jquery.tmpl.min.js\
	${SRC_DIR}/deck.js/core/deck.core.js\
	${SRC_DIR}/codemirror/lib/codemirror.js\
	${SRC_DIR}/codemirror/mode/xml/xml.js\
	${SRC_DIR}/codemirror/mode/css/css.js\
	${SRC_DIR}/codemirror/mode/javascript/javascript.js\
	${SRC_DIR}/codemirror/mode/htmlmixed/htmlmixed.js\
	${SRC_DIR}/deck.js/extensions/status/deck.status.js\
	${SRC_DIR}/deck.js/extensions/navigation/deck.navigation.js\
	${SRC_DIR}/deck.coder.js\
	${SRC_DIR}/deck.js/extensions/hash/deck.hash.js\
	${SRC_DIR}/deck.js/extensions/menu/deck.menu.js

MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}

CODERDECK= ${DIST_DIR}/coderdeck.js
CODERDECK_MIN = ${DIST_DIR}/coderdeck.min.js

CODERDECK_VER = $(shell cat version.txt)
VER = sed "s/@VERSION/${CODERDECK_VER}/"

DATE=$(shell git log -1 --pretty=format:%ad)

all: update_submodules core

core: coderdeck min
	@@echo "Coderdeck build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

coderdeck: ${CODERDECK}

${CODERDECK}: ${MODULES} | ${DIST_DIR}
	@@echo "Building" ${CODERDECK}

	@@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		${VER} > ${CODERDECK};

min: coderdeck ${CODERDECK_MIN}

${CODERDECK_MIN}: ${CODERDECK}
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying CoderDeck" ${CODERDECK_MIN}; \
		${COMPILER} ${CODERDECK} > ${CODERDECK_MIN}.tmp; \
		${POST_COMPILER} ${CODERDECK_MIN}.tmp > ${CODERDECK_MIN}; \
		rm -f ${CODERDECK_MIN}.tmp; \
	else \
		echo "You must have NodeJS installed in order to minify jQuery."; \
	fi

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

distclean: clean
	@@echo "Removing submodules"

# change pointers for submodules and update them to what is specified in jQuery
# --merge  doesn't work when doing an initial clone, thus test if we have non-existing
#  submodules, then do an real update
update_submodules:
	@@if [ -d .git ]; then \
		if git submodule status | grep -q -E '^-'; then \
			git submodule update --init --recursive; \
		else \
			git submodule update --init --recursive --merge; \
		fi; \
	fi;

# update the submodules to the latest at the most logical branch
pull_submodules:
	@@git submodule foreach "git pull \$$(git config remote.origin.url)"
	@@git submodule summary

pull: pull_submodules
	@@git pull ${REMOTE} ${BRANCH}

