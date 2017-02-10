const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const recursiveReadSync = require('recursive-readdir-sync');
const ROOT_PATH = path.join(__dirname, '..');

const CONTRACTS = _.chain(recursiveReadSync(ROOT_PATH))
  .map(_.partial(path.relative, ROOT_PATH))
  .filter((filePath) => {
    return _.every([
      _.isEqual(path.extname(filePath), '.json'),
      !_.startsWith(filePath, '.'),
      !_.startsWith(filePath, 'node_modules'),
      !_.startsWith(filePath, 'package.json')
    ]);
  })
  .map((filePath) => {
    return {
      path: filePath,
      name: path.basename(filePath, path.extname(filePath)),
      contents: require(path.join(ROOT_PATH, filePath))
    };
  })
  .value();

_.each(CONTRACTS, (contract) => {

  if (!_.isEqual(contract.name, contract.contents.name)) {
    console.error('Contract name should equal file name');
    console.error(`\t${contract.path}`);
  }

});
