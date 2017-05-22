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

const buildPullRequestInstructions = (averageCompletion) => {
    const status = averageCompletion !== 100 ? '> :white_check_mark: This is safe to merge (even if marked as WIP).\n>\n> If conflicts appear, the likely cause is that translation files were manually changed while Mercury was running.\nIn that case, you can close this PR: a new one will be opened with no conflicts.\n\n' : '';
    return status;
};

const buildPullRequestStatus = (averageCompletion) => {
    const status = averageCompletion !== 100 ? '[WIP]' : '[COMPLETE]';
    return `${status} - ${buildPercentageStat(averageCompletion)} Overall Completion`;
};

const buildTitle = (averageCompletion) => {
    return `Mercury Pull Request ${buildPullRequestStatus(averageCompletion)}`;
}

const buildExcludedStringLink = (smartlingProjectId, localeKey) => {
    return ' ([view in Smartling](https://dashboard.smartling.com/projects/' + smartlingProjectId + '/content/content.htm#excluded/list/filter/locale:' + localeKey + '))';
}

const format = (repository) => {

    const averageCompletion = prMetaDataCalculator.calculateAverage(
        prMetaDataCalculator.sumPercentageCompletedOfLocales(repository),
        prMetaDataCalculator.countLocales(repository));

    const title = buildTitle(averageCompletion);

    let body = '';

    body += buildPullRequestInstructions(averageCompletion);

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
