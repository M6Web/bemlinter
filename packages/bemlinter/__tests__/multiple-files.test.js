const {lint, format} = require('../src/bemlinter.js');

const snap = (fileName, done, options = {}) => {
  lint(`${__dirname}/sources/${fileName}`, options)
    .then(lintResult => format(lintResult, false))
    .then(output => {
      expect(output).toMatchSnapshot();
      done();
    })
    .catch(error => {
      console.error(error);
      done();
    })
  ;
};

describe('Bemlinter of crossed styled files', () => {
  it('should log error on both blocks', done => snap('cross-styling/*.scss', done, {classPrefix: 'c-'}));
  
  it('should not log error on the external block', done => snap('cross-styling/*.scss', done, {
    excludeBlock: ['external'],
    classPrefix: 'c-'
  }));
});

describe('Bemlinter of multi-modules files', () => {
  it('should detect the module and the missing prefix', done => snap('mixed-settings/*.scss', done, {
    modules: [{
      name: 'module',
      sources: [`${__dirname}/sources/mixed-settings/module-prefixed.scss`],
      filePattern: 'module-([^.]*)\.scss'
    }]
  }));

  it('should detect the module and the associate leak styles', done => snap('mixed-settings/*.scss', done, {
    modules: [{
      name: 'module',
      sources: [`${__dirname}/sources/mixed-settings/module-prefixed.scss`],
      classPrefix: 'c-',
      filePattern: 'module-([^.]*)\.scss'
    }]
  }));
});