# webui

This is the home of the web user-interface for Galasa.

## Technologies used
- [Typescript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Carbon controls](https://carbondesignsystem.com/all-about-carbon/what-is-carbon/)


## Set up
- Clone the repository
- Run the `setup-locally.sh` script

## To build locally

To build the code, it needs to get the REST interface definition from somewhere, to generate stubs in order to make calling the REST API easy.
Hence, we need to tell the build where to get this definition from. 

If you don't have the `galasa` repository built locally, then the default behaviour is to refer to a hosted version.

If you do have a built `galasa` repository already, then we can refer to your `~/.m2` repository using the `SOURCE_MAVEN` environment variable.
```shell
export SOURCE_MAVEN="file://${HOME}/.m2/repository"
```

then...

- Run the `build-locally.sh` script

## To run development server locally
- Run the `run-locally.sh` script

## Connecting the local development web UI with a remote API server

If you would like to run the web UI locally and have it connect to an existing Galasa service's backend, perform the following steps:

1. Make sure that you have access to an existing Galasa service and are able to log in to its web UI - if you do not have access, contact your Galasa service administrator
2. Navigate to the remote Galasa service's webui and create a new personal access token. The personal access token value will be in the form `<string>:<string>` - note this token value down
3. Set the `GALASA_DEV_TOKEN` environment variable, either in the terminal that you will use to start the webui or inside a new `.env.development.local` file, to be the personal access token that was just created
    - For example, if your access token was `my:token`, you could create a new `.env.development.local` file next to the existing `.env` file and then set the environment variable in the file like `GALASA_DEV_TOKEN="my:token"`
4. Set the `GALASA_API_SERVER_URL` environment variable, either in the same terminal that you will use to start the webui or inside the `.env.development.local` file that you may have created in step 3, to be the URL of the remote Galasa service's API server
    - For example, if the Galasa service's webui URL was `https://my-galasa-service.dev`, then the API server URL would be `https://my-galasa-service.dev/api` (added `/api` to the end of the URL)
5. Start the webui locally

## How to contribute
See the [contributions.md](./CONTRIBUTIONS.md) file for terms and instructions.
