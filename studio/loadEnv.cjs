const { config: dotenv } = require('dotenv');
const path = require('path');

const loadEnvironment = () => {
  dotenv({ path: path.resolve(__dirname, '../.env') });
  dotenv({ path: path.resolve(__dirname, '.env') });
};

module.exports = { loadEnvironment };
