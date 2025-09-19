// /*
//  * Copyright contributors to the Galasa project
//  *
//  * SPDX-License-Identifier: EPL-2.0
//  */

// import React from 'react';
// import { DropdownOption } from '@/utils/interfaces/3270Terminal';
// import { encodeStateToUrlParam } from '@/utils/urlEncoder';
// import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// export function handleURL(
//   router: AppRouterInstance,
//   highlightedRowId: string,
//   searchTerm: string,
//   selectedTerminal: DropdownOption | null
// ): void {
//   // const pathname = usePathname();
//   // const searchParams = useSearchParams();

//   const updatedUrl = new URL(window.location.href);

//   if (updatedUrl.searchParams.has('terminalScreen')) {
//     updatedUrl.searchParams.set('terminalScreen', highlightedRowId);
//   } else {
//     updatedUrl.searchParams.append('terminalScreen', highlightedRowId);
//   }

//   // Update the router state with the new URL
//   router.replace(updatedUrl.toString(), { scroll: false });

//   // const encoded3270filterParams = encodeStateToUrlParam(params.toString());
//   // router.replace(`${pathname}?q=${encoded3270filterParams}`);
// }

// // const updateUrl = (params: URLSearchParams) => {
// //   const newUrl = `${pathname}?${params.toString()}`;
// //   router.replace(newUrl, { scroll: false });
// // };
