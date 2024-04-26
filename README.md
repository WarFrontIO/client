# WarFront.io

WarFront.io is a real-time strategy game that is played in the browser. Still early in development.

## Building

To build the project, you will need to have Node.js and npm installed. You can download them from [here](https://nodejs.org/).

Before building the project, you will need to install the dependencies. You can do this by running the following command in the project directory:

```bash
git submodule update --init --recursive
npm install
npm run prebuild
```

To build the project, you can run the following command:

```bash
npm run build-dev
```

Or for a production build:

```bash
npm run build-prod
```

