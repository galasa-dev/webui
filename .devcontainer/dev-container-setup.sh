#!/bin/bash

#
# Copyright contributors to the Galasa project
#
# SPDX-License-Identifier: EPL-2.0
#

GALASA_DEV_TOKEN_VALUE="$1"
GALASA_API_SERVER_URL_VALUE="$2"
SOURCE_MAVEN_VALUE="$3"

PROFILE_FILE="/home/node/.bashrc"

if [ -n "$GALASA_DEV_TOKEN_VALUE" ]; then
  echo "export GALASA_DEV_TOKEN=$GALASA_DEV_TOKEN_VALUE" >> $PROFILE_FILE
fi

if [ -n "$GALASA_API_SERVER_URL_VALUE" ]; then
  echo "export GALASA_API_SERVER_URL=$GALASA_API_SERVER_URL_VALUE" >> $PROFILE_FILE
fi

if [ -n "$SOURCE_MAVEN_VALUE" ]; then
  echo "export SOURCE_MAVEN=$SOURCE_MAVEN_VALUE" >> $PROFILE_FILE
fi