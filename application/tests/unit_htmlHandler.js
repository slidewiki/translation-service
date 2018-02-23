/*eslint indent: "warn"*/
/*eslint no-irregular-whitespace: "warn"*/
'use strict';

describe('Unit Tests - htmlHandler.js', () => {

    let handler, expect, fs = require('fs');

    beforeEach((done) => {
        //Clean everything up before doing new tests
        Object.keys(require.cache).forEach((key) => delete require.cache[key]);
        require('chai').should();
        let chai = require('chai');
        let chaiAsPromised = require('chai-as-promised');
        chai.use(chaiAsPromised);
        expect = require('chai').expect;
        handler = require('../controllers/htmlHandler.js');
        done();
    });

    const notHtml = 'Dies ist ein slide text und er enthält kein HTML.';
    const translatedText0 = ': 100:: Dies ist ein slide text und er enthält kein HTML.';

    const html1 = fs.readFileSync('./tests/resources/1.html', 'utf8');
    const translatedText1 = ': 41477:: Titel des Jahres';

    const html2 = fs.readFileSync('./tests/resources/2.html', 'utf8');
    const translatedText2 = ': 41477:: Titel des Jahres: 12874:: Paragraph des Monats';

    const html3 = fs.readFileSync('./tests/resources/3.html', 'utf8');
    const translatedText3 = ': 41477:: Titel des Jahres: 100:: dummytext: 12874:: Paragraph des: 101:: Monat: 12874-2:: wieder: 100-2:: extra Inhalt\n';

    const html4 = fs.readFileSync('./tests/resources/4.html', 'utf8');
    const translatedText4 = ': 27820:: Presentation of Models, which are used as part of the RE and design process,: 50573:: Usage of grafical models,: 89921:: Why?: 62932:: models of context: 95449:: Interaction models: 49812:: structural models: 99369:: models of whatever: 47708:: Concepts are awesome.: 80771:: Modelling of a system: 77370:: Targets: 48519:: (cc) : 51726:: All material provided on the SE9 website by Ian : 18535:: Sommerville: 52664:: http: 25872:: ://www.softwareengineering-9.com/';

    const html5 = fs.readFileSync('./tests/resources/5.html', 'utf8');

    const translatedText5 = ': 75726:: Text Text: 47481:: Text: 75726-2:: Text: 63577:: sadfsdff : 25264:: sdf ds sdf sdaf sfas';

    const html6 = fs.readFileSync('./tests/resources/6.html', 'utf8');

    const translatedText6 = ': 67711:: wfdedfsdf: 18077:: Text bullet 1: 75442:: Text bullet 2: 22340:: hohohohoho Dies ist meine Rache!: 38405:: Monat2: 68998:: Baum2: 29503:: Wiese2: 81919:: Vogel2: 26814:: Eis2';

    context('Basic html to text', () => {
        it('no HTML, just text', () => {
            let {
                text,
                simpleText,
                html
            } = handler.htmlToText(notHtml);

            console.log('New text:', text, '\n');
            console.log('New html:', html, '\n');

            expect(simpleText).to.equal(notHtml);

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText0, html);

            expect(translatedHtml).to.equal(notHtml);
        });
        it('one title', () => {
            let {
                text,
                simpleText,
                html
            } = handler.htmlToText(html1);

            console.log('New text:', text, '\n');
            console.log('New html:', html, '\n');

            expect(simpleText).to.equal('Title of the year\n');

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText1, html);

            expect(translatedHtml).to.equal(fs.readFileSync('./tests/resources/1_translated.html', 'utf8'));
        });
        it('one title and a paragraph', () => {
            let {
                text,
                simpleText,
                html
            } = handler.htmlToText(html2);

            console.log('New text:', text, '\n');

            expect(simpleText).to.equal(`Title of the year
Paragraph of the month
`);

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText2, html);

            expect(translatedHtml).to.equal(fs.readFileSync('./tests/resources/2_translated.html', 'utf8'));
        });
        it('one title and a paragraph with bold text and text in between', () => {
            let {
                text,
                simpleText,
                html
            } = handler.htmlToText(html3);

            console.log('New text:', text, '\n');

            expect(simpleText).to.equal(`Title of the year
dummytext
Paragraph of the month again
extra content
`);

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText3, html);

            expect(translatedHtml).to.equal(fs.readFileSync('./tests/resources/3_translated.html', 'utf8'));
        });

        it('big html from slide  (slidewiki.aksw.org)', () => {
            let {
                text,
                html
            } = handler.htmlToText(html4);

            console.log('New text:', text, '\n');

            // expect(simpleText).to.equal(`Lernziele und Übersicht
            //   Systemmodellierung
            //   Vorstellung von Systemmodellen, die als Teil des RE und Entwurfsprozesses zum Einsatz kommen,
            //   Einsatz grafischer Modelle zur Repräsentation von Softwaresystemen,
            //   Warum sind unterschiedliche Modelltypen notwendig?
            //   Kontextmodelle
            //   Interaktionsmodelle
            //   Strukturmodelle
            //   Verhaltensmodelle
            //   Konzepte auf denen die modellgetriebene Softwareentwicklung beruht, um beispielsweise ein System aus struktur- und verhaltensbasierten Modellen zu erzeugen.`);

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText4, html);

            expect(translatedHtml).to.equal(fs.readFileSync('./tests/resources/4_translated.html', 'utf8'));
        });

        it('Code and math elements', () => {
            let {
                text,
                html
            } = handler.htmlToText(html5);

            console.log('New text:', text, '\n');

//             expect(simpleText).to.equal(`Text Text
// Text
// sadfsdff 
//
// sdf ds sdf sdaf sfas`);

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText5, html);

            expect(translatedHtml).to.equal(fs.readFileSync('./tests/resources/5_translated.html', 'utf8'));
        });

        it('With everything', () => {
            let {
                text,
                html
            } = handler.htmlToText(html6);

            console.log('New text:', text, '\n');

//             expect(simpleText).to.equal(``);

            //now use translated text to update html
            let translatedHtml = handler.setTranslatedTextInHtml(translatedText6, html);

            expect(translatedHtml).to.equal(fs.readFileSync('./tests/resources/6_translated.html', 'utf8'));
        });
    });
});
