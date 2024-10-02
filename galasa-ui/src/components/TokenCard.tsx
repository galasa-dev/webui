/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useState } from "react";
import styles from "../styles/TokenCard.module.css";
import { Password } from '@carbon/icons-react';
import { SelectableTile } from '@carbon/react';
import Token from "@/utils/interfaces/Token";

function TokenCard({token, selectTokenForDeletion} : {token : Token, selectTokenForDeletion: Function}){

  //The token creation time receieved from the API is: e.g 2024-09-25T10:02:55.732580Z
  // Splitting at "T" will give us the date part of the creationTime ---> split = [2024-09-25 , 10:02:55.732580Z]
  // split[0] ---> 2024-09-25
  const trimmedTime = token.creationTime.split("T");

  return(

    <SelectableTile onClick={() => selectTokenForDeletion(token.tokenId)} value={true} key={token.tokenId} className={styles.cardContainer}>

      <h5>{token.description}</h5>
      <div className={styles.infoContainer}>

        <h6>Created at: {trimmedTime[0]}</h6>
        <h6>Owner: {token.owner.loginId}</h6>
                
      </div>

      <Password className={styles.icon} size={40}/>

    </SelectableTile>
        
  );

}

export default TokenCard;