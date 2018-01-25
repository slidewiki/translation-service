'use strict';

describe('Unit Tests - htmlHandler.js', () => {

  let handler, expect, config;

  beforeEach((done) => {
    //Clean everything up before doing new tests
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
    require('chai').should();
    let chai = require('chai');
    let chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    expect = require('chai').expect;
    handler = require('../controllers/htmlHandler.js');
    config = require('../configuration.js');
    done();
  });

  const html1 = '<h1 id="41477">Title of the year</h1>';
  const translatedText1 = ': 41477:: Titel des Jahres';

  const html2 = `<h1 id="41477">Title of the year</h1>
<p id="12874">Paragraph of the month</p>`;
const translatedText2 = `: 41477:: Titel des Jahres: 12874:: Paragraph des Monats`;

  const html3 = `<h1 id="41477">Title of the year</h1>
dummytext
<p id="12874">Paragraph of the <b>month</b> again</p>
extra content`;
const translatedText3 = `: 41477:: Titel des Jahres: 100:: dummytext: 12874:: Paragraph des: 101:: Monat: 100-2:: wieder: 100:: dummytext: 100-2::
extra Inhalt`;

  const html4 = `<div class="pptx2html" id="81669" style="position: relative; width: 960px; height: 720px; border-style: double; border-color: rgba(218, 102, 25, 0.5); transform: scale(1.13048, 1.13048); transform-origin: left top 0px;">
<div id="76310"></div>

<div _id="6" _idx="4294967295" _name="Textplatzhalter 5" _type="undefined" class="block content v-up" id="53346" style="position: absolute; top: 95.4037px; left: 52.9132px; width: 859.087px; height: 547.763px; border: 1pt rgb(0, 0, 0); background-color: initial; z-index: 26728; cursor: auto;" tabindex="0">
<div class="context-menu-one ui button blue outline 53346" id="53346" style="top: -32px; left: 0px; position: absolute; z-index: 90000000; display: none; cursor: auto;" tabindex="-1"></div>

<div class="53346dragdiv dragdiv ui button orange outline" style="top: -32px; left: -30px; right: -30px; bottom: -30px; position: absolute; z-index: -1; opacity: 0.1; display: none; cursor: auto;" tabindex="-1"></div>

<ul id="68133" style="list-style-type:circle;margin-left:30px;">
	<li id="84276">
	<div class="h-left" id="81612"><span class="text-block" id="27820" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Vorstellung&nbsp;von Systemmodellen, die als Teil des RE und Entwurfsprozesses zum Einsatz kommen,</span></div>
	</li>
	<li id="48271">
	<div class="h-left" id="51594"><span class="text-block" id="50573" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Einsatz&nbsp;grafischer Modelle zur Repräsentation von Softwaresystemen,</span></div>
	</li>
	<li id="38012">
	<div class="h-left" id="26602"><span class="text-block" id="89921" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Warum&nbsp;sind unterschiedliche Modelltypen notwendig?</span></div>
	</li>
</ul>

<ul id="47949" style="list-style-type:square;margin-left:60px;">
	<li id="24009">
	<div class="h-left" id="16926"><span class="text-block" id="62932" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Kontextmodelle</span></div>
	</li>
	<li id="5363">
	<div class="h-left" id="63855"><span class="text-block" id="95449" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Interaktionsmodelle</span></div>
	</li>
	<li id="77417">
	<div class="h-left" id="85821"><span class="text-block" id="49812" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Strukturmodelle</span></div>
	</li>
	<li id="50978">
	<div class="h-left" id="65636"><span class="text-block" id="99369" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Verhaltensmodelle</span></div>
	</li>
</ul>

<ul id="99336" style="list-style-type:circle;margin-left:30px;">
	<li id="88413">
	<div class="h-left" id="50306"><span class="text-block" id="47708" style="color: inherit; font-size: 20pt; font-family: +mn-lt; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Konzepte&nbsp;auf denen die modellgetriebene Softwareentwicklung beruht, um beispielsweise ein System aus struktur- und verhaltensbasierten Modellen zu erzeugen.</span></div>
	</li>
</ul>
</div>

<div _id="8" _idx="undefined" _name="Text Box 65" _type="undefined" class="drawing-container" id="79956" style="position: absolute; top: 7.99958px; left: 52.9132px; width: 684.123px; height: 50.0841px; z-index: 26775; cursor: auto;" tabindex="0">
<div class="context-menu-one ui button blue outline 79956" id="79956" style="top: -32px; left: 0px; position: absolute; z-index: 90000000; display: none; cursor: auto;" tabindex="-1"></div>

<div class="79956dragdiv dragdiv ui button orange outline" style="top: -32px; left: -30px; right: -30px; bottom: -30px; position: absolute; z-index: -1; opacity: 0.1; display: none; cursor: auto;" tabindex="-1"></div>
<svg _id="8" _idx="undefined" _name="Text Box 65" _type="undefined" class="drawing" id="81355" style="position: absolute; top: 0px; left: 0px; width: 684.123px; height: 50.0841px; z-index: 26775; cursor: auto;"><rect fill="none" height="50.084094488188974" id="74361" stroke="none" stroke-dasharray="0" stroke-width="1" width="684.1228346456693" x="0" y="0"></rect></svg></div>

<div _id="8" _idx="undefined" _name="Text Box 65" _type="undefined" class="block content v-up" id="15747" style="position: absolute; top: 7.99958px; left: 52.9132px; width: 684.123px; height: 50.0841px; z-index: 26775; cursor: auto;" tabindex="0">
<div class="context-menu-one ui button blue outline 15747" id="15747" style="top: -32px; left: 0px; position: absolute; z-index: 90000000; display: none; cursor: auto;" tabindex="-1"></div>

<div class="15747dragdiv dragdiv ui button orange outline" style="top: -32px; left: -30px; right: -30px; bottom: -30px; position: absolute; z-index: -1; opacity: 0.1; display: none; cursor: auto;" tabindex="-1"></div>

<div class="h-left" id="35466"><span class="text-block" id="80771" style="color: #595959; font-size: 25pt; font-family: inherit; font-weight: bold; font-style: inherit; text-decoration: initial; vertical-align: ;">Systemmodellierung</span></div>
</div>

<div _id="12" _idx="undefined" _name="Titel 4" _type="title" class="block content v-mid" id="31803" style="position: absolute; top: 48.2841px; left: 52.9131px; width: 480px; height: 31.9996px; border: 1pt rgb(0, 0, 0); z-index: 26797; cursor: auto;" tabindex="0">
<div class="context-menu-one ui button blue outline 31803" id="31803" style="top: -32px; left: 0px; position: absolute; z-index: 90000000; display: none; cursor: auto;" tabindex="-1"></div>

<div class="31803dragdiv dragdiv ui button orange outline" style="top: -32px; left: -30px; right: -30px; bottom: -30px; position: absolute; z-index: -1; opacity: 0.1; display: none; cursor: auto;" tabindex="-1"></div>

<div class="h-mid" id="92156">
<h3 id="35494"><span class="text-block" id="77370" style="color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Lernziele&nbsp;und Übersicht</span></h3>
</div>
</div>

<div _id="2" _idx="undefined" _name="Textfeld 1" _type="undefined" class="drawing-container" id="23186" style="position: absolute; top: 654.836px; left: 45.2588px; width: 842.976px; height: 25.85px; z-index: 26906; cursor: auto;" tabindex="0">
<div class="context-menu-one ui button blue outline 23186" id="23186" style="top: -32px; left: 0px; position: absolute; z-index: 90000000; display: none; cursor: auto;" tabindex="-1"></div>

<div class="23186dragdiv dragdiv ui button orange outline" style="top: -32px; left: -30px; right: -30px; bottom: -30px; position: absolute; z-index: -1; opacity: 0.1; display: none; cursor: auto;" tabindex="-1"></div>
<svg _id="2" _idx="undefined" _name="Textfeld 1" _type="undefined" class="drawing" id="70670" style="position: absolute; top: 0px; left: 0px; width: 842.976px; height: 25.85px; z-index: 26906; cursor: auto;"><rect fill="none" height="25.84997375328084" id="91980" stroke="none" stroke-dasharray="0" stroke-width="1" width="842.9755380577428" x="0" y="0"></rect></svg></div>

<div _id="2" _idx="undefined" _name="Textfeld 1" _type="undefined" class="block content v-up" id="31330" style="position: absolute; top: 654.836px; left: 45.2588px; width: 842.976px; height: 25.85px; z-index: 26906; cursor: auto;" tabindex="0">
<div class="context-menu-one ui button blue outline 31330" id="31330" style="top: -32px; left: 0px; position: absolute; z-index: 90000000; display: none; cursor: auto;" tabindex="-1"></div>

<div class="31330dragdiv dragdiv ui button orange outline" style="top: -32px; left: -30px; right: -30px; bottom: -30px; position: absolute; z-index: -1; opacity: 0.1; display: none; cursor: auto;" tabindex="-1"></div>

<div class="h-left" id="99720"><span class="text-block" id="48519" style="color: inherit; font-size: 10pt; font-family: Arial; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">(cc)&nbsp;</span><span class="text-block" id="51726" style="color: inherit; font-size: 10pt; font-family: Arial; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">All&nbsp;material provided on the SE9 website by Ian </span><span class="text-block" id="18535" style="color: inherit; font-size: 10pt; font-family: Arial; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">Sommerville</span><span class="text-block" id="39606" style="color: inherit; font-size: 10pt; font-family: Arial; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">&nbsp;- </span><span class="text-block" id="52664" style="color: inherit; font-size: 10pt; font-family: Arial; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">http</span><span class="text-block" id="25872" style="color: inherit; font-size: 10pt; font-family: Arial; font-weight: inherit; font-style: inherit; text-decoration: initial; vertical-align: ;">://www.softwareengineering-9.com/</span></div>
</div>
</div>
`;

  context('Basic html to text', () => {
    it('one title', () => {
      let {text, simpleText, html} = handler.htmlToText(html1);

      console.log('New text:', text, "\n");
      console.log('New html:', html, "\n");

      expect(simpleText).to.equal(`Title of the year`);

      //now use translated text to update html
      let translatedHtml = handler.setTranslatedTextInHtml(translatedText1, html);

      expect(translatedHtml).to.equal(`<h1 id="41477">Titel des Jahres</h1>`);
    });
    it('one title and a paragraph', () => {
      let {text, simpleText, html} = handler.htmlToText(html2);

      console.log('New text:', text, "\n");

      expect(simpleText).to.equal(`Title of the year
Paragraph of the month`);

      //now use translated text to update html
      let translatedHtml = handler.setTranslatedTextInHtml(translatedText2, html);

      expect(translatedHtml).to.equal(`<h1 id="41477">Titel des Jahres</h1>
<p id="12874">Paragraph des Monats</p>`);
    });
    it('one title and a paragraph with bold text and text in between', () => {
      let {text, simpleText, html} = handler.htmlToText(html3);

      console.log('New text:', text, "\n");

      expect(simpleText).to.equal(`Title of the year
dummytext
Paragraph of the month again
extra content`);

      //now use translated text to update html
      let translatedHtml = handler.setTranslatedTextInHtml(translatedText3, html);

      expect(translatedHtml).to.equal(`<h1 id="41477">Titel des Jahres</h1>
dummytext
<p id="12874">Paragraph des <b id="100">Monat</b> again</p>
extra Inhalt`);
    });

    // it('big html from slide  (slidewiki.aksw.org)', () => {
    //   let {text, simpleText, html} = handler.htmlToText(html4);
    //
    //   console.log('New text:', text, "\n");
    //
    //   expect(simpleText).to.equal(`Lernziele und Übersicht
    //     Systemmodellierung
    //     Vorstellung von Systemmodellen, die als Teil des RE und Entwurfsprozesses zum Einsatz kommen,
    //     Einsatz grafischer Modelle zur Repräsentation von Softwaresystemen,
    //     Warum sind unterschiedliche Modelltypen notwendig?
    //     Kontextmodelle
    //     Interaktionsmodelle
    //     Strukturmodelle
    //     Verhaltensmodelle
    //     Konzepte auf denen die modellgetriebene Softwareentwicklung beruht, um beispielsweise ein System aus struktur- und verhaltensbasierten Modellen zu erzeugen.`);
    // });
  });
});
