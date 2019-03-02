# Apollo Transmission

An example Apollo application.

## Prerequisites

* [Node.js](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/)
* [Docker](https://www.docker.com/products/docker-desktop) - optional, for running database locally

## How to run the app

1. Run `docker-compose up` in a terminal.
2. Open the second tab of the terminal and run `yarn` and then `yarn start`.
3. Run migrations in the third tab by running `yarn migrate`.
You can also generate some fake data by running `yarn seed`.

The app will be available at http://127.0.0.1:3000/
