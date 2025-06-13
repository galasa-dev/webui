/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const CLIENT_API_VERSION = "0.43.0";

const COLORS = {

  RED: "#da1e28",
  GREEN: "#24A148",
  NEUTRAL: "#6f6f6f",
  BLUE: "#0043ce",
  YELLOW: "#f1c21b"

};

const BREADCRUMB_ITEMS = {

  HOME: [

    {
      title: "Home",
      route: "/"
    }

  ],
  EDIT_USER: [

    {
      title: "Home",
      route: "/"
    },
    {
      title: "Users",
      route: "/users"
    }

  ],
  TEST_RUNS: [
    {
      title: "Home",
      route: "/"
    },
    {
      title: "Test Runs",
      route: "/test-runs"
    }
  ]

};


export { CLIENT_API_VERSION, COLORS, BREADCRUMB_ITEMS };