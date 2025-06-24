/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export const handleDeleteCookieApiOperation = async (router: any) => {
  const response = await fetch('/logout', { method: 'DELETE' });
  if (response.status === 204) {
    //auto redirect to render dex login page
    router.refresh();
  }
};
