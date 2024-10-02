/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

interface Token {
    tokenId: string;
    description: string;
    creationTime: string;
    owner: {
        loginId: string;
    };
}

export default Token;