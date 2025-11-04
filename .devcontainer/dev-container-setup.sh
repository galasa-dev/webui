#!/bin/bash

#
# Copyright contributors to the Galasa project
#
# SPDX-License-Identifier: EPL-2.0
#

# Unset empty variables so that secondary .env files can be used
if [ -z "$GALASA_DEV_TOKEN" ]; then
  unset GALASA_DEV_TOKEN
fi

if [ -n "$GALASA_API_SERVER_URL" ]; then
  unset GALASA_DEV_TOKEN
fi

if [ -n "$SOURCE_MAVEN" ]; then
  unset SOURCE_MAVEN
fi