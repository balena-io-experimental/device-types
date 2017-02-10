const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const recursiveReadSync = require('recursive-readdir-sync');
const jsonschema = require('jsonschema');
const ROOT_PATH = path.join(__dirname, '..');

const SCHEMAS = _.chain(fs.readdirSync(path.join(ROOT_PATH, 'schemas')))
  .map((schemaName) => {
    return JSON.parse(fs.readFileSync(path.join(ROOT_PATH, 'schemas', schemaName), {
      encoding: 'utf8'
    }));
  })
  .map((schema) => {
    return [ schema.title, schema ];
  })
  .fromPairs()
  .value();

const validate = (contract, schema) => {
  const validator = new jsonschema.Validator();
  return validator.validate(contract, schema).errors;
};

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

const findContract = (type, name) => {
  return _.find(CONTRACTS, (contract) => {
    return _.every([
      contract.contents.type === type,
      contract.name === name
    ]);
  });
};

const DUPLICATES = _.chain(CONTRACTS)
  .groupBy('contents.name')
  .pickBy((contracts) => {
    return contracts.length > 1;
  })
  .mapValues((value) => {
    return _.map(value, 'path');
  })
  .value();

_.each(DUPLICATES, (value, key) => {
  console.error('Contract names should be unique');
  console.error(`\t${key}:`);

  _.each(value, (duplicatedPath) => {
    console.log(`\t\t${duplicatedPath}`);
  });
});

_.each(CONTRACTS, (contract) => {

  if (!_.isEqual(contract.name, contract.contents.name)) {
    console.error('Contract name should equal file name');
    console.error(`\t${contract.path}`);
  }

  if (_.has(contract.contents, 'link')) {
    _.each(contract.contents.link, (name, type) => {

      if (_.isUndefined(findContract(type, name))) {
        console.error('Contracts should link to valid contracts');
        console.error(`\t${contract.name}`);
        console.error(`\t\t${type} -> ${name}`);
      }
    });
  }

  const schema = _.get(SCHEMAS, contract.contents.type);

  if (_.isUndefined(schema)) {
    console.error('Contracts should have an accompanying schema');
    console.error(`\t${contract.contents.type}`);
  }

  const validationErrors = validate(contract.contents, schema);

  if (!_.isEmpty(validationErrors)) {
    console.error('Contracts should adhere to their schema');
    console.error(`\t${contract.name}`);

    _.each(validationErrors, (error) => {
      console.error(`\t\t${error.stack}`);
    });
  }
});
