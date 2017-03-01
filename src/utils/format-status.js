'use strict';

function roundToTwo(num) {    
    return +(Math.round(num + 'e+1') + 'e-1');
}

const percent = (completedStringCount, totalStringCount) => {
    return roundToTwo((completedStringCount / totalStringCount) * 100);
}

const format = (repository) => {
    let status = '';
    
    repository.translationFiles.forEach(file => {
        status = status.concat(`Translation status of ${file.github}:\n`);
        const totalStringCount = file.totalStringCount;
        
        for (let locale in file.locales) {
            const localeStatus = file.locales[locale].smartlingStatus;
            const completedStringCount = localeStatus.completedStringCount;
            const percentage = percent(completedStringCount, totalStringCount);
            const stringToken = completedStringCount === 1 ? 'string' : 'strings';
            
            status = status.concat(`${locale} locale: ${completedStringCount} completed ${stringToken} out of ${totalStringCount} (${percentage}%)\n`)
        }
    });
    
    return status;
};

module.exports = {
    format
}
