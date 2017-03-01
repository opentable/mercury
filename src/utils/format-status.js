'use strict';

function roundToTwo(num) {    
    return +(Math.round(num + 'e+1') + 'e-1');
}

const percent = (completedStringCount, totalStringCount) => {
    return roundToTwo((completedStringCount / totalStringCount) * 100);
};

const buildHeader = (status, file) => {
    let header = `\n**Translation status of ${file.github}:**\n\n| | completed | % |\n|---|---|---|\n`;
    status = status.concat(header);
    return status;
};

const buildPercentageStat = (percentage) => {
    return percentage || percentage === 0 ? `${percentage.toString()}%` : 'N/A';
};

const buildCompletionStat = (completedStringCount, totalStringCount) => {
    return completedStringCount || completedStringCount === 0 ? `${completedStringCount} out of ${totalStringCount}` : 'N/A';
};

const format = (repository) => {
    let status = '';
    
    repository.translationFiles.forEach(file => {
        status = buildHeader(status, file);
        
        const totalStringCount = file.totalStringCount;
        
        for (let locale in file.locales) {
            const localeStatus = file.locales[locale].smartlingStatus;
            const completedStringCount = localeStatus.completedStringCount;
            const percentage = percent(completedStringCount, totalStringCount);
            
            status = status.concat(`| **${locale}** | ${buildCompletionStat(completedStringCount, totalStringCount)} | ${buildPercentageStat(percentage)} |\n`)
        }
    });
    
    return status;
};

module.exports = {
    format
}
