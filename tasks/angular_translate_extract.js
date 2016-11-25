/*
 * grunt-angular-translate-extract
 * https://github.com/pchorus/grunt-angular-translate-extract
 *
 * Copyright (c) 2015 Pascal Chorus
 * Licensed under the MIT license.
 *
 * Code copied from 
 * grunt-angular-translate (https://github.com/firehist/grunt-angular-translate)
 * and modified due to requirements of this plugin.
 */

'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('angular_translate_extract', 'Grunt plugin for extracting angular-translate texts to POT file.', function() {

    // Shorcuts!
    var _ = require('lodash');
    var _log = grunt.log;
    var _file = grunt.file;

    // Declare all var from configuration
    var files = this.files,
      interpolation = this.data.interpolation || {startDelimiter: '{{', endDelimiter: '}}'},
      customRegex = _.isArray(this.data.customRegex) ? this.data.customRegex : [],
      extractSourceFiles = this.data.extractSourceFiles;

    if (extractSourceFiles === undefined) {
      extractSourceFiles = true;
    }

    // Use to escape some char into regex patterns
    var escapeRegExp = function (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };

    // Regexs that will be executed on files
    var regexs = {
      commentSimpleQuote: '\\/\\*\\s*i18nextract\\s*\\*\\/\'((?:\\\\.|[^\'\\\\])*)\'',
      commentDoubleQuote: '\\/\\*\\s*i18nextract\\s*\\*\\/"((?:\\\\.|[^"\\\\])*)"',
      HtmlFilterSimpleQuote: escapeRegExp(interpolation.startDelimiter) + '\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate(:.*?)?\\s*' + escapeRegExp(interpolation.endDelimiter),
      HtmlFilterDoubleQuote: escapeRegExp(interpolation.startDelimiter) + '\\s*"((?:\\\\.|[^"\\\\\])*)"\\s*\\|\\s*translate(:.*?)?\\s*' + escapeRegExp(interpolation.endDelimiter),
      // > can be used within attribute values. Therefore, > does only terminate the open tag when it appears outside of quotes.
      HtmlDirective: '<[^>]*translate(?:[^\'">]*(?:"[^"]*"|\'[^\']*\')[^\'">]*)*>(.*)<\\/[^>]*>',
      HtmlDirectiveStandalone: 'translate="((?:\\\\.|[^"\\\\])*)"',
      HtmlDirectivePluralLast: 'translate="((?:\\\\.|[^"\\\\])*)".*angular-plural-extract="((?:\\\\.|[^"\\\\])*)"',
      HtmlDirectivePluralFirst: 'angular-plural-extract="((?:\\\\.|[^"\\\\])*)".*translate="((?:\\\\.|[^"\\\\])*)"',
      HtmlNgBindHtml: 'ng-bind-html="\\s*\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate(:.*?)?\\s*"',
      JavascriptServiceSimpleQuote: '\\$translate\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
      JavascriptServiceDoubleQuote: '\\$translate\\(\\s*"((?:\\\\.|[^"\\\\])*)"[^\\)]*\\)',
      JavascriptServiceArraySimpleQuote: '\\$translate\\((?:\\s*(\\[\\s*(?:(?:\'(?:(?:\\.|[^.*\'\\\\])*)\')\\s*,*\\s*)+\\s*\\])\\s*)\\)',
      JavascriptServiceArrayDoubleQuote: '\\$translate\\((?:\\s*(\\[\\s*(?:(?:"(?:(?:\\.|[^.*\'\\\\])*)")\\s*,*\\s*)+\\s*\\])\\s*)\\)',
      JavascriptServiceInstantSimpleQuote: '\\$translate\\.instant\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
      JavascriptServiceInstantDoubleQuote: '\\$translate\\.instant\\(\\s*"((?:\\\\.|[^"\\\\])*)"[^\\)]*\\)',
      JavascriptFilterSimpleQuote: '\\$filter\\(\\s*\'translate\'\\s*\\)\\s*\\(\\s*\'((?:\\\\.|[^\'\\\\])*)\'[^\\)]*\\)',
      JavascriptFilterDoubleQuote: '\\$filter\\(\\s*"translate"\\s*\\)\\s*\\(\\s*"((?:\\\\.|[^"\\\\\])*)"[^\\)]*\\)'
    };

    _.forEach(customRegex, function (regex, key) {
      regexs['others_' + key] = regex;
    });

    // process each file in the configuration
    files.forEach(function (file) {
      var results = {}, output = getPotFileHeader();

      file.src.forEach(function (fileSrc) {
        processFile(fileSrc, results);
      });

      _log.writeln('Create file: ' + file.dest);

      for (var key in results) {
        if (results.hasOwnProperty(key)) {
          if (extractSourceFiles) {
            output += '\n#:';
            _.forEach(results[key].sourceFiles, function (sourceFile) {
               output += ' ' + sourceFile.file + ':' + sourceFile.line;
            });
          }
          output += '\nmsgid "' + key + '"\n';
          output += 'msgstr ""\n';
        }
      }
      _file.write(file.dest, output);
    });

    function getPotFileHeader() {
      var header = 'msgid ""\n';
      
      header += 'msgstr ""\n';
      header += '"Content-Type: text/plain; charset=UTF-8\\n"\n';
      header += '"Content-Transfer-Encoding: 8bit\\n"\n';
      header += '"Project-Id-Version: \\n"\n';

      return header;
    }

    function processFile(file, results) {
      _log.debug("Process file: " + file);
      var content = _file.read(file), _regex,
        j,
        lines;

      // Execute all regex defined at the top of this file
      for (var i in regexs) {
        _regex = new RegExp(regexs[i], "gi");
        lines = content.split('\n');
        for (j = 0; j < lines.length; j += 1) {
          switch (i) {
            // Case filter HTML simple/double quoted
            case "HtmlFilterSimpleQuote":
            case "HtmlFilterDoubleQuote":
            case "HtmlDirective":
            case "HtmlDirectivePluralLast":
            case "HtmlDirectivePluralFirst":
            case "JavascriptFilterSimpleQuote":
            case "JavascriptFilterDoubleQuote":
              // Match all occurences
              var matches = lines[j].match(_regex);
              if (_.isArray(matches) && matches.length) {
                // Through each matches, we'll execute regex to get translation key
                for (var index in matches) {
                  if (matches[index] !== "") {
                    _extractTranslation(i, _regex, matches[index], file, j+1, results);
                  }
                }
              }
              break;
            // Others regex
            default:
              _extractTranslation(i, _regex, lines[j], file, j+1, results);
          }
        }
      }
    }

    // Extract regex strings from content and feed results object
    function _extractTranslation(regexName, regex, content, file, lineNumber, results) {
      var r;
      _log.debug("---------------------------------------------------------------------------------------------------");
      _log.debug('Process extraction with regex : "' + regexName + '"');
      _log.debug(regex);
      regex.lastIndex = 0;
      while ((r = regex.exec(content)) !== null) {

        // Result expected [STRING, KEY, SOME_REGEX_STUF]
        // Except for plural hack [STRING, KEY, ARRAY_IN_STRING]
        if (r.length >= 2) {
          var translationKey, evalString;
          var translationDefaultValue = "";

          switch (regexName) {
            case 'HtmlDirectivePluralFirst':
              var tmp = r[1];
              r[1] = r[2];
              r[2] = tmp;
              /* falls through */
            case 'HtmlDirectivePluralLast':
              evalString = eval(r[2]);
              if (_.isArray(evalString) && evalString.length >= 2) {
                translationDefaultValue = "{NB, plural, one{" + evalString[0] + "} other{" + evalString[1] + "}" + (evalString[2] ? ' ' + evalString[2] : '');
              }
              translationKey = r[1].trim();
              break;
            default:
              translationKey = r[1].trim();
          }

          // Avoid empty translation
          if (translationKey === "") {
            return;
          }

          switch (regexName) {
            case "commentSimpleQuote":
            case "HtmlFilterSimpleQuote":
            case "JavascriptServiceSimpleQuote":
            case "JavascriptServiceInstantSimpleQuote":
            case "JavascriptFilterSimpleQuote":
            case "HtmlNgBindHtml":
              translationKey = translationKey.replace(/\\\'/g, "'");
              break;
            case "commentDoubleQuote":
            case "HtmlFilterDoubleQuote":
            case "JavascriptServiceDoubleQuote":
            case "JavascriptServiceInstantDoubleQuote":
            case "JavascriptFilterDoubleQuote":
              translationKey = translationKey.replace(/\\\"/g, '"');
              break;
            case "JavascriptServiceArraySimpleQuote":
            case "JavascriptServiceArrayDoubleQuote":
              var key;

              if(regexName === "JavascriptServiceArraySimpleQuote") {
                key = translationKey.replace(/'/g, '');
              } else {
                key = translationKey.replace(/"/g, '');
              }
              key = key.replace(/[\][]/g, '');
              key = key.split(',');

              key.forEach(function(item){
                item = item.replace(/\\\"/g, '"').trim();
                if (results[item]) {
                  results[item].sourceFiles.push({
                    file: file,
                    line: lineNumber
                  });
                } else {
                  results[item] = {
                    defaultValue: translationDefaultValue,
                    sourceFiles: [{
                      file: file,
                      line: lineNumber
                    }]
                  };
                }
              });
              break;
          }

          if( regexName !== "JavascriptServiceArraySimpleQuote" &&
              regexName !== "JavascriptServiceArrayDoubleQuote") {
            if (results[translationKey]) {
              results[translationKey].sourceFiles.push({
                file: file,
                line: lineNumber
              });
            } else {
              results[ translationKey ] = {
                defaultValue: translationDefaultValue,
                sourceFiles: [{
                  file: file,
                  line: lineNumber
                }]
              };
            }
          }
        }
      }
    }

  });
};
