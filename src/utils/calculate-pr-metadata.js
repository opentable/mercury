'use strict';

const _ = require('lodash');

function roundToOne(num) {
  return +(Math.round(num + 'e+1') + 'e-1');
}

const calculateAverage = (percentageCount, localesCount) => {
  return roundToOne(percentageCount / localesCount);
};

const calculatePercent = (completedStringCount, totalStringCount) => {
  return roundToOne(completedStringCount / totalStringCount * 100);
};

const countLocales = repository => {
  return repository.translationFiles.reduce(function(acc, current) {
    return acc + Object.keys(current.locales).length;
  }, 0);
};

const countExcludedStrings = repository => {
  return _.chain(repository.translationFiles)
    .map(translationFile => _.values(translationFile.locales))
    .flatten()
    .map(locale => locale.smartlingStatus.excludedStringCount)
    .reduce((sum, n) => sum + n, 0)
    .value();
};

const sumPercentageCompletedByFile = locales => {
  let totalLocales = 0;
  const totalCompleted = _.reduce(
    locales,
    (sum, locale) => {
      totalLocales++;
      return sum + locale.value.smartlingStatus.percentCompleted;
    },
    0
  );

  return calculateAverage(totalCompleted, totalLocales);
};

const sumPercentageCompletedOverall = repo => {
  return _.chain(repo.translationFiles)
    .map(translationFile => _.values(translationFile.locales))
    .flatten()
    .map(locale => locale.smartlingStatus.percentCompleted)
    .reduce((sum, n) => sum + n, 0)
    .value();
};

const sortLocales = locales => {
  return _.chain(Object.keys(locales))
    .map(key => {
      return { key, value: locales[key] };
    })
    .sortBy(o => {
      return o.key;
    })
    .value();
};

module.exports = {
  calculateAverage,
  calculatePercent,
  countExcludedStrings,
  sumPercentageCompletedByFile,
  sumPercentageCompletedOverall,
  countLocales,
  sortLocales
};
