'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const statusFormatter = require('../../src/utils/format-status');

const statusFormatRepository = {
    translationFiles: [ 
        {
            github: 'src/locales/en-us/file.json',
            totalStringCount: 10,
            locales: {
                'de-DE': {
                    smartlingStatus: { completedStringCount: 1 }
                },
                'nl-NL': { 
                    smartlingStatus: { completedStringCount: 10 }
                }
            }
        },
        {
            github: 'src/locales/en-us/other-file.json',
            totalStringCount: 30,
            locales: {
                'de-DE': {
                    smartlingStatus: { completedStringCount: 22 }
                },
                'nl-NL': { 
                    smartlingStatus: { completedStringCount: 0 }
                }
            }
        }
    ]
}

describe('statusFormatter.format()', () => {
    
    describe('happy path', () => {
        
        let res;
                
        beforeEach((done) => {
            const repo = statusFormatRepository;
            res = statusFormatter.format(_.cloneDeep(repo));
            done();
        });
        
        it('should include the status of src/locales/en-us/file.json', () => {
            expect(res).to.include('Translation status of src/locales/en-us/file.json:');
            expect(res).to.include('de-DE locale: 1 completed string out of 10 (10%)');
            expect(res).to.include('nl-NL locale: 10 completed strings out of 10 (100%)');
        });
        
        it('should include the status of src/locales/en-us/other-file.json', () => {
            expect(res).to.include('Translation status of src/locales/en-us/other-file.json:');
            expect(res).to.include('de-DE locale: 22 completed strings out of 30 (73.3%)');
            expect(res).to.include('nl-NL locale: 0 completed strings out of 30 (0%)');
        });
    });
});
