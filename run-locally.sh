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

function build_locally {
    ${BASEDIR}/build-locally.sh --delta
}

function check_env_variables {
    cd ${BASEDIR}/galasa-ui

    h2 "Checking that the required environment variables have been set..."

    # Find any environment variables within the .env file that have not been set
    envVarPattern="\w*=\"\""
    envVarsWithMissingValues=$(grep "${envVarPattern}" .env)

    if [ ! -z "${envVarsWithMissingValues}" ]; then
        error "One or more required environment variables in .env have not been set. Please set values for the following environment variables:
${envVarsWithMissingValues}"
        exit 1
    fi

    success "Required environment variables are set OK."
}

function run_webui {
    cd ${BASEDIR}/galasa-ui/.next

    h2 "Starting web UI server..."
    cp -r static standalone/.next
    node standalone/server.js
}

build_locally
check_env_variables
run_webui
