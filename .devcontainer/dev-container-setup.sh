#
# Copyright contributors to the Galasa project
#
# SPDX-License-Identifier: EPL-2.0
#

function check_required_environemnt_variables () {
    REQUIRED_ENVS=("GALASA_API_SERVER_URL")

    for VAR in "${REQUIRED_ENVS[@]}"; do
        if [ -z "${!VAR}" ]; then
            echo "Error: Required environment variable $VAR is not set! Please set the variable on your host machine and restart VS Code."

            exit 1
        fi
    done

    echo "All required environment variables are set."
}

check_required_environemnt_variables