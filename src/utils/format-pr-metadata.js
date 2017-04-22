'use strict';

const _ = require('lodash');

function roundToOne(num) {    
    return +(Math.round(num + 'e+1') + 'e-1');
}

const calculateAverage = (percentageCount, localesCount) => {
    return roundToOne(percentageCount / localesCount);
};

const calculatePercent = (completedStringCount, totalStringCount) => {
    return roundToOne((completedStringCount / totalStringCount) * 100);
};

const countLocales = (repository) => {
    return repository.translationFiles.reduce(function (acc, current) {
        return acc + Object.keys(current.locales).length;
    }, 0);
};

const countExcludedStrings = (repository) => {
    return _.chain(repository.translationFiles)
            .map(translationFile => _.values(translationFile.locales))
            .flatten()
            .map(locale => locale.smartlingStatus.excludedStringCount)
            .reduce((sum, n) => sum + n, 0)
            .value();
};

const sumPercentageCompletedOfLocales = (repo) => {
    return _.chain(repo.translationFiles)
        .map(translationFile => _.values(translationFile.locales))
        .flatten()
        .map(locale => locale.smartlingStatus.percentCompleted)
        .reduce((sum, n) => sum + n, 0)
        .value();
};

const sortLocales = (locales) => {
    return  _
        .chain(Object.keys(locales))
        .map((key) => { return {  key, value: locales[key] } })
        .sortBy((o) => { return o.key } )
        .value();
};

const buildUnauthorisedStringWarning = () => {
    return '> :warning: WARNING\n> Your project contains excluded strings.\n> This typically indicates strings that are being managed outside of Smartling workflow.\n';
};

const buildHeader = (body, file) => {
    const header = `\n**Translation status of ${file.github}:**\n\n| | excluded strings | translated strings | total strings | % |\n|---|---|---|---|---|\n`;
    body = body.concat(header);
    return body;
};

const buildPercentageStat = (percentage) => {
    return percentage || percentage === 0 ? `${percentage.toString()}%` : 'N/A';
};

const buildPullRequestStatus = (averageCompletion) => {
    const status = averageCompletion !== 100 ? 'WIP' : 'READY TO MERGE';
    return `[${status} - ${buildPercentageStat(averageCompletion)} Overall Completion]`;
};


const format = (repository) => {
    let body = '';
    let title = '';


    if(countExcludedStrings(repository) > 0) {
        body += buildUnauthorisedStringWarning();
    }

    //const sortedFiles = repository.translationFiles.map(function(file) {
        //var rObj = {};
        //rObj[obj.key] = obj.value;
      //  file.locales = sortLocales(file.locales);
      //  return file;
    //});

    //const localesCount = repository.translationFiles.reduce(function (acc, current) {
    //    return acc + Object.keys(current.locales).length;
    //}, 0);

    //const percentageCount = repository.translationFiles.reduce(function (acc, currentFile) {
    //    return acc + currentFile.locales.reduce(function (acc, currentLocale) {
    //            return acc + currentLocale.percentCompleted;
    //        }, 0);
    //}, 0);

    //const percentageCount = countPercentages(repository.translationFiles);
   // let percentageCount = sumPercentageCompletedOfLocales(repo);


    repository.translationFiles.forEach(file => {
    //sortedFiles.forEach(file => {
        body = buildHeader(body, file);
        
        const totalStringCount = file.totalStringCount;

        const sortedLocales = sortLocales(file.locales);

        _.forEach(sortedLocales, function(locale){
            const localeStatus = locale.value.smartlingStatus;

            const excludedStringCount = localeStatus.excludedStringCount || 0;
            const completedStringCount = localeStatus.completedStringCount || 0;
            const percentage = localeStatus.percentCompleted;

            let linkToExcludedStringView = '';
            if(excludedStringCount > 0) {
                linkToExcludedStringView =
                    ' ([view in Smartling](https://dashboard.smartling.com/projects/' +
                    repository.manifestContent.smartlingProjectId +
                    '/content/content.htm#excluded/list/filter/locale:' +
                    locale.key + '))';
            }
            
            body = body.concat(`| **${locale.key}** | ${excludedStringCount}${linkToExcludedStringView} | ${completedStringCount} | ${totalStringCount} | ${buildPercentageStat(percentage)} |\n`)
        });
    });
    
    const averageCompletion = calculateAverage(sumPercentageCompletedOfLocales(repository), countLocales(repository));
    title = `Mercury Pull Request ${buildPullRequestStatus(averageCompletion)}`
    
    return {
        body,
        title
    };
};

module.exports = {
    calculatePercent,
    sumPercentageCompletedOfLocales,
    sortLocales,
    countLocales,
    format
}
