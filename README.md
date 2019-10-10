# Luke's NC-News

## Summary

This project is designed to act as a backend for future development of a full-stack portfolio piece. It uses Express to provide an API which reads and writes to a PostgreSQL database which holds information about topics, articles, comments and users for a news site.

A hosted version of the app can be found at: https://nc-news-luke.herokuapp.com/api

That link returns a JSON object which describes the available endpoints.

## Use the code yourself

### Prerequisites

To run the app without making any alterations, you will need to have Node, NPM and PostgreSQL installed.

The hosted app is currently running on Node 16.10.3 and PostgreSQL 11.5. It is likely to run successfully on older or newer versions but that can't be guaranteed.

### Forking/Cloning and Installing Dependencies

The code is all available at: https://github.com/Luke9090/be-nc-news-luke

If you would like to edit the code before running it, begin by clicking the fork button in the top right corner.

To download the code to your own device, click the "clone or download" button, either on my project page or your own forked version. Copy the provided link, open your terminal program/command line and navigate to a suitable folder before running:

`git clone <copied link>`

Change directory into the cloned folder and run:
`npm install`

This will install the necessary NPM packages to run the app.

### Creating Knex File

The app uses an NPM package called Knex (knexjs.org) to interact with the database, which should have been installed as a dependency above. In order for Knex to access the database, you will need to create a config file which has not been provided because some of the keys vary depending on your own environment. Create a file called `knexfile.js` in the project root. Start by copying the following text into it:

```const ENV = process.env.NODE_ENV || 'development';
const { DB_URL } = process.env;

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

const customConfig = {
  development: {
    connection: {
      database: 'nc_news',
      // username: 'your_username',
      // password: 'your_password'
    }
  },
  test: {
    connection: {
      database: 'nc_news_test',
      // username: 'your_username',
      // password: 'your_password'
    }
  },
  production: {
    connection: `${DB_URL}?ssl=true`
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
```

If you are on Linux, you will probably need to remove the leading slashes from the username and password lines and fill in the username and password that you set up when you installed PostgreSQL (NOTE: You will need to do this twice, once for the test key and once for the development key). On Mac OS X, this should not be necessary as your version of PostgreSQL stores the username and password elsewhere.

### Creating Databases, Seeding and Running the Server

A variety of npm scripts are provided and can be seen in the package.json file. You might wish to take a look. To create the databases, seed them with data and run the server, use the following commands in your terminal/command line...

Create databases: `npm run setup-dbs`
Seed data: `npm run seed`
Start server: `npm start`

If you have run the commands successfully, you should now be able to visit the endpoints in your browser to see the app in action on your own device.

http://localhost:9090/api

To see the returned data formatted more clearly, you could install an app like Insomnia (http://insomnia.rest), which will also allow you to test HTTP methods other than GET, such as POST, PATCH or DELETE.
