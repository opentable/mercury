'use strict';

const prMetaDataCalculator = require('./calculate-pr-metadata');

const buildExcludedStringWarning = () => {
    return '> :warning: WARNING\n>\n> Your project contains excluded strings. This typically indicates strings that are being managed outside of Smartling workflow. See [Mercury FAQ](https://github.com/opentable/mercury/blob/master/docs/faq.md) for more information.\n';
};

const buildHeaderForFile = (file) => {
    return `\n**Translation status of ${file.src}:**\n\n| | excluded strings | translated strings | total strings | % |\n|---|---|---|---|---|\n`;
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

    const title = buildTitle(repository);

    let body = '';

    if (prMetaDataCalculator.countExcludedStrings(repository) > 0) {
        body += buildExcludedStringWarning();
    }

    body += repository.translationFiles.reduce((accumulatorForTranslationFiles, file) => {

        const totalStringCount = file.totalStringCount;

        const sortedLocales = prMetaDataCalculator.sortLocales(file.locales);

        return accumulatorForTranslationFiles.concat(
            buildHeaderForFile(file),
            sortedLocales.reduce((accumulatorForLocales, locale) => {
                const localeStatus = locale.value.smartlingStatus;
                const excludedStringCount = localeStatus.excludedStringCount || 0;
                const completedStringCount = localeStatus.completedStringCount || 0;
                const percentage = localeStatus.percentCompleted;

                return accumulatorForLocales.concat(`| **${locale.key}** | ${excludedStringCount}${excludedStringCount > 0 ? buildExcludedStringLink(repository.manifestContent.smartlingProjectId, locale.key) : '' } | ${completedStringCount} | ${totalStringCount} | ${buildPercentageStat(percentage)} |\n`);
            }, ''));
    },'');

    return {
        body,
        title
    };
};

module.exports = {
    format
}
