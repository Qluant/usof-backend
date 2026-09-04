const app = require('./src/app');
const appConfig = require('./config/app.config');

const PORT = appConfig.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${appConfig.nodeEnv} mode.`);
});
