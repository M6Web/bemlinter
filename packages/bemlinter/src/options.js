const _ = require('lodash');
const globby = require('globby');

// Settings
const defaultModuleOptions = {
  excludeBlock: [],
  checkLowerCase: true,
  classPrefix: '',
  filePattern: '([^.]*)\.s?css',
  snapshot: false
};

function createModuleOptions(options, moduleOptions) {
  if (!moduleOptions.name) {
    console.error('Your module should have a name');
  }
  if (!moduleOptions.sources) {
    console.error(`Your module "${moduleOptions.name}" should have sources`);
  }
  if (typeof moduleOptions.sources === 'string') {
    moduleOptions.sources = [moduleOptions.sources];
  }

  return _.merge({}, _.omit(options, 'modules', 'snapshot'), moduleOptions);
}

function createOptions(userOptions, isRoot = true) {
  const options = _.merge({}, defaultModuleOptions, userOptions);
  if (options.snapshot === true) {
    options.snapshot = './.bemlinter-snap';
  }
  if (!options.sources) {
    console.error(`Your configuration file should have sources`);
  }
  if (typeof options.sources === 'string') {
    options.sources = [options.sources];
  }
  options.name = '__root';
  options.modules = (options.modules || []).map(moduleOptions => createModuleOptions(options, moduleOptions));

  return options;
}

module.exports = userOptions => {
  const options = createOptions(userOptions);

  function getOptions(optionName) {
    if (optionName) {
      return options[optionName]
    }

    return options;
  }

  function getFileOptions(filePath) {
    const fileOptions = _.find(options.modules, moduleOptions => {
      const globbyResult = globby.sync([filePath, ...moduleOptions.sources.map(modulePath => `!${modulePath}`)]);
      return !globbyResult.length;
    });

    return fileOptions || options;
  }

  function getClassPrefixList() {
    const classPrefixList = _.uniq([options.classPrefix].concat(_.map(options.modules, 'classPrefix')));
    return _.reverse(_.sortBy(classPrefixList, 'length'));
  }

  function getModuleNameByClassPrefix(classPrefix) {
    if (options.classPrefix === classPrefix) {
      return options.name;
    }

    const module = options.modules.find(moduleOptions => moduleOptions.classPrefix === classPrefix);
    if (!module) {
      return false
    }
    return module.name;
  }

  return {getOptions, getFileOptions, getClassPrefixList, getModuleNameByClassPrefix}
};
