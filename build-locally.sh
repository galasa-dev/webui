#!/usr/bin/env bash

#
# Copyright contributors to the Galasa project
#
# SPDX-License-Identifier: EPL-2.0
#

# Where is this script executing from ?
BASEDIR=$(dirname "$0");pushd $BASEDIR 2>&1 >> /dev/null ;BASEDIR=$(pwd);popd 2>&1 >> /dev/null
# echo "Running from directory ${BASEDIR}"
export ORIGINAL_DIR=$(pwd)
cd "${BASEDIR}"


#--------------------------------------------------------------------------
# Set Colors
#--------------------------------------------------------------------------
bold=$(tput bold)
underline=$(tput sgr 0 1)
reset=$(tput sgr0)

red=$(tput setaf 1)
green=$(tput setaf 76)
white=$(tput setaf 7)
tan=$(tput setaf 202)
blue=$(tput setaf 25)

#--------------------------------------------------------------------------
#
# Headers and Logging
#
#--------------------------------------------------------------------------
underline() { printf "${underline}${bold}%s${reset}\n" "$@"
}
h1() { printf "\n${underline}${bold}${blue}%s${reset}\n" "$@"
}
h2() { printf "\n${underline}${bold}${white}%s${reset}\n" "$@"
}
debug() { printf "${white}%s${reset}\n" "$@"
}
info() { printf "${white}➜ %s${reset}\n" "$@"
}
success() { printf "${green}✔ %s${reset}\n" "$@"
}
error() { printf "${red}✖ %s${reset}\n" "$@"
}
warn() { printf "${tan}➜ %s${reset}\n" "$@"
}
bold() { printf "${bold}%s${reset}\n" "$@"
}
note() { printf "\n${underline}${bold}${blue}Note:${reset} ${blue}%s${reset}\n" "$@"
}

#-----------------------------------------------------------------------------------------
# Functions
#-----------------------------------------------------------------------------------------
function usage {
    info "Syntax: build-locally.sh [OPTIONS]"
    cat << EOF
Options are:
-c | --clean : Do a clean build. One of the --clean or --delta flags are mandatory.
-d | --delta : Do a delta build. One of the --clean or --delta flags are mandatory.

Environment variables used:
None
EOF
}

#--------------------------------------------------------------------------
#
# Main script logic
#
#--------------------------------------------------------------------------

#-----------------------------------------------------------------------------------------
# Process parameters
#-----------------------------------------------------------------------------------------
function process_parameters {
    export build_type=""

    while [ "$1" != "" ]; do
        case $1 in
            -c | --clean )          build_type="clean"
                                    ;;
            -d | --delta )          build_type="delta"
                                    ;;
            -h | --help )           usage
                                    exit
                                    ;;
            * )                     error "Unexpected argument $1"
                                    usage
                                    exit 1
        esac
        shift
    done

    if [[ "${build_type}" == "" ]]; then
        error "Need to use either the --clean or --delta parameter."
        usage
        exit 1
    fi
}

function clean {
    rm -rf ${BASEDIR}/galasa-ui/src/generated
    success "Cleaned up OK"
}

process_parameters $*

# Clean up if we need to.
if [[ "${build_type}" == "clean" ]]; then
    clean
fi

# Invoke the generator.
function generate_rest_client {
    h2 "Generate the openapi client TypeScript code..."

    if [[ "${build_type}" == "clean" ]]; then
        h2 "Cleaning the generated code out..."
        rm -fr ${BASEDIR}/galasa-ui/src/generated/*
    fi

    gradle --warning-mode all --info --debug generateTypeScriptClient
    rc=$? ; if [[ "${rc}" != "0" ]]; then error "Failed to generate the TypeScript client code from the openapi.yaml file. rc=${rc}" ; exit 1 ; fi
    success "Code generation OK"

    h2 "Fixing compilation errors in generated code..."
    tempDir="${BASEDIR}/temp"
    rm -fr ${tempDir}
    mkdir -p ${tempDir}

    # PromiseAPI.ts gets generated with compilation errors due to a clashing constant named "result", so rename "result" to "apiResult"
    promiseApiFile="${BASEDIR}/galasa-ui/src/generated/galasaapi/types/PromiseAPI.ts"
    cat ${promiseApiFile} | sed "s/const result =/const apiResult =/g" > ${tempDir}/PromiseAPI-temp.ts
    cat ${tempDir}/PromiseAPI-temp.ts | sed "s/return result\.toPromise/return apiResult\.toPromise/g" > ${tempDir}/PromiseAPI.ts
    cp ${tempDir}/PromiseAPI.ts ${promiseApiFile}

    # index.ts gets generated with type errors, so fix them
    indexFile="${BASEDIR}/galasa-ui/src/generated/galasaapi/index.ts"
    cat ${indexFile} | sed "s/export { Configuration/export { type Configuration/1" > ${tempDir}/index-temp.ts
    cat ${tempDir}/index-temp.ts | sed "s/export { PromiseMiddleware/export { type PromiseMiddleware/1" > ${tempDir}/index.ts
    cp ${tempDir}/index.ts ${indexFile}

    success "OK"
}

function run_tests {
    cd ${BASEDIR}/galasa-ui
    npm test -- --watchAll=false
    rc=$?
    if [[ "${rc}" != "0" ]]; then
        error "Failing tests."
        exit 1
    fi
    success "Unit tests all pass OK."
}

function do_build {
    cd ${BASEDIR}/galasa-ui
    npm run build
    rc=$?
    if [[ "${rc}" != "0" ]]; then
        error "Failed to build."
        exit 1
    fi
    success "Built OK."
}

generate_rest_client
run_tests
do_build
success "Project built OK."
