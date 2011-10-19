SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

CODERDECK_VER = $(shell cat version.txt)

PREFIX = .
PACKAGE_DIR = ${PREFIX}/dist
OUTPUT_NAME = CoderDeck-${CODERDECK_VER}
DIST_DIR = ${PREFIX}/dist/${OUTPUT_NAME}/dist
OUTPUT_FILE = ${PREFIX}/dist/${OUTPUT_NAME}.tar.gz

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
	${SRC_DIR}/prettify.js\
	${SRC_DIR}/deck.coder.js\
	${SRC_DIR}/deck.js/extensions/hash/deck.hash.js\
	${SRC_DIR}/deck.js/extensions/menu/deck.menu.js

CSS_FILES = ${SRC_DIR}/deck.js/core/deck.core.css\
	${SRC_DIR}/deck.js/core/deck.core.css\
	${SRC_DIR}/deck.js/extensions/navigation/deck.navigation.css\
	${SRC_DIR}/deck.js/extensions/status/deck.status.css\
	${SRC_DIR}/deck.js/extensions/hash/deck.hash.css\
	${SRC_DIR}/deck.js/extensions/menu/deck.menu.css\
	${SRC_DIR}/css/deck.coder.css\
	${SRC_DIR}/css/prettify.css\
	${SRC_DIR}/codemirror/lib/codemirror.css\
	${SRC_DIR}/codemirror/theme/default.css


MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}

CODERDECK= ${DIST_DIR}/coderdeck.js
CODERDECK_MIN = ${DIST_DIR}/coderdeck.min.js

CSS_MIN = ${DIST_DIR}/coderdeck-core.min.css

VER = sed "s/@VERSION/${CODERDECK_VER}/"

DATE=$(shell git log -1 --pretty=format:%ad)

all: update_submodules core

core: coderdeck css jquery min ${OUTPUT_FILE}
	@@echo "Coderdeck build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

coderdeck: ${CODERDECK}

css:
	cat ${CSS_FILES} > ${CSS_MIN}
	cp ${SRC_DIR}/css/coderdeck.css ${DIST_DIR}/

jquery:
	cp ${SRC_DIR}/jquery.min.js ${DIST_DIR}/
	cp ${SRC_DIR}/modernizr.js ${DIST_DIR}/


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
		echo "You must have NodeJS installed in order to minify CoderDeck."; \
	fi

${OUTPUT_FILE}: 
	@@echo "Tarring"
	cp ${PREFIX}/sample-dist.html ${PACKAGE_DIR}/${OUTPUT_NAME}/index.html; \
	cp ${PREFIX}/MIT-LICENSE.txt ${PACKAGE_DIR}/${OUTPUT_NAME}/; \
	cp ${PREFIX}/GPL-LICENSE.txt ${PACKAGE_DIR}/${OUTPUT_NAME}/; \
	cp ${PREFIX}/README.md ${PACKAGE_DIR}/${OUTPUT_NAME}/; \
	cd ${PACKAGE_DIR} && tar -czvf ${OUTPUT_NAME}.tar.gz ${OUTPUT_NAME}


clean:
	@@echo "Removing Distribution directory:" ${PACKAGE_DIR}
	@@rm -rf ${PACKAGE_DIR}

distclean: clean
	@@echo "Removing submodules"

# change pointers for submodules and update them to what is specified in CoderDeck 
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

