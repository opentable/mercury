'use strict';

const _ = require('lodash');
const prMetaDataCalculator = require('./calculate-pr-metadata');

const buildUnauthorisedStringWarning = () => {
    return '> :warning: WARNING\n> Your project contains excluded strings.\n> This typically indicates strings that are being managed outside of Smartling workflow.\n';
};

const buildHeaderForFile = (body, file) => {
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

const buildTitle = (repository) => {
    const averageCompletion = prMetaDataCalculator.calculateAverage(
        prMetaDataCalculator.sumPercentageCompletedOfLocales(repository),
        prMetaDataCalculator.countLocales(repository));

    return `Mercury Pull Request ${buildPullRequestStatus(averageCompletion)}`;
}

const buildExcludedStringLink = (smartlingProjectId, localeKey) => {
    return ' ([view in Smartling](https://dashboard.smartling.com/projects/' + smartlingProjectId + '/content/content.htm#excluded/list/filter/locale:' + localeKey + '))';
}

const format = (repository) => {
    let body = '';

    if(prMetaDataCalculator.countExcludedStrings(repository) > 0) {
        body += buildUnauthorisedStringWarning();
    }

    repository.translationFiles.forEach(file => {
        body = buildHeaderForFile(body, file);

        const totalStringCount = file.totalStringCount;

        const sortedLocales = prMetaDataCalculator.sortLocales(file.locales);

        _.forEach(sortedLocales, function(locale){
            const localeStatus = locale.value.smartlingStatus;

            const excludedStringCount = localeStatus.excludedStringCount || 0;
            const completedStringCount = localeStatus.completedStringCount || 0;
            const percentage = localeStatus.percentCompleted;

            let linkToExcludedStringView = '';
            if(excludedStringCount > 0) {
                linkToExcludedStringView = buildExcludedStringLink(repository.manifestContent.smartlingProjectId, locale.key);
            }

            body = body.concat(`| **${locale.key}** | ${excludedStringCount}${linkToExcludedStringView} | ${completedStringCount} | ${totalStringCount} | ${buildPercentageStat(percentage)} |\n`)
        });
    });

    const title = buildTitle(repository);

    return {
        body,
        title
    };
};

module.exports = {
    format
}
