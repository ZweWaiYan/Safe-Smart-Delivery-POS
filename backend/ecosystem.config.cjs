module.exports = {
  apps: [
    {
      name: "backend",               // process name shown in `pm2 ls`
     script: "./index.js",          // entry point of your app
      watch: true,                   // restart app on file changes
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
