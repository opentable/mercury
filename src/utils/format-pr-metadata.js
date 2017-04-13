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

const countExcludedStrings = (repository) => {
    return _.chain(repository.translationFiles)
            .map(translationFile => _.values(translationFile.locales))
            .flatten()
            .map(locale => locale.smartlingStatus.excludedStringCount)
            .reduce((sum, n) => sum + n, 0)
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
    let localesCount = 0;
    let percentageCount = 0;

    if(countExcludedStrings(repository) > 0) {
        body += buildUnauthorisedStringWarning();
    }
    
    repository.translationFiles.forEach(file => {
        body = buildHeader(body, file);
        
        const totalStringCount = file.totalStringCount;
        
        for (let locale in file.locales) {
            const localeStatus = file.locales[locale].smartlingStatus;
            const excludedStringCount = localeStatus.excludedStringCount;
            const completedStringCount = localeStatus.completedStringCount;
            const percentage = localeStatus.percentCompleted;
            percentageCount = percentageCount + percentage;
            localesCount++;

            const excludedStringStatus = `${excludedStringCount}${excludedStringCount > 0 ? ' ([view in Smartling](https://dashboard.smartling.com/projects/' + repository.manifestContent.smartlingProjectId + '/content/content.htm#excluded/list/filter/locale:' + locale + '))' : ''}`;
            
            body = body.concat(`| **${locale}** | ${excludedStringStatus} | ${completedStringCount} | ${totalStringCount} | ${buildPercentageStat(percentage)} |\n`)
        }
    });
    
    const averageCompletion = calculateAverage(percentageCount, localesCount);
    title = `Mercury Pull Request ${buildPullRequestStatus(averageCompletion)}`
    
    return {
        body,
        title
    };
};

module.exports = {
    calculatePercent,
    format
}
