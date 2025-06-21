/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';

export default function NotFound({ title, description }: { title: string, description: string }) {
  return (
    <main className='center'>
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
}