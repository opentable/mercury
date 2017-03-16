'use strict';

function roundToOne(num) {    
    return +(Math.round(num + 'e+1') + 'e-1');
}

const calculateAverage = (percentageCount, localesCount) => {
    return roundToOne(percentageCount / localesCount);
};

const calculatePercent = (completedStringCount, totalStringCount) => {
    return roundToOne((completedStringCount / totalStringCount) * 100);
};

const buildHeader = (body, file) => {
    const header = `\n**Translation status of ${file.github}:**\n\n| | complete | % |\n|---|---|---|\n`;
    body = body.concat(header);
    return body;
};

const buildCompletionStat = (completedStringCount, totalStringCount) => {
    return completedStringCount || completedStringCount === 0 ? `${completedStringCount} out of ${totalStringCount}` : 'N/A';
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
    
    repository.translationFiles.forEach(file => {
        body = buildHeader(body, file);
        
        const totalStringCount = file.totalStringCount;
        
        for (let locale in file.locales) {
            const localeStatus = file.locales[locale].smartlingStatus;
            const completedStringCount = localeStatus.completedStringCount;
            const percentage = localeStatus.percentCompleted;
            percentageCount = percentageCount + percentage;
            localesCount++;
            
            body = body.concat(`| **${locale}** | ${buildCompletionStat(completedStringCount, totalStringCount)} | ${buildPercentageStat(percentage)} |\n`)
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
