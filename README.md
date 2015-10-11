# grunt-angular-translate-extract [![Build Status](https://travis-ci.org/pchorus/grunt-angular-translate-extract.svg?branch=master)](https://travis-ci.org/pchorus/grunt-angular-translate-extract)

> Grunt plugin for extracting angular-translate texts to POT file.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-angular-translate-extract --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-angular-translate-extract');
```

## The "angular_translate_extract" task

### Overview
In your project's Gruntfile, add a section named `angular_translate_extract` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  angular_translate_extract: {
    default_options: {
      files: {
        'all_texts.pot': ['**/*.js', '**/*.html']
      }
    },
  },
});
```

### Options

#### extractSourceFiles
Type: `Boolean`
Default value: `true`

Example: `extractSourceFiles: false`

Decide wether the source files containing the text should be extracted or not.

Output example with source files:
```
#: test/fixtures/example.html:8
msgid "Filter custom interpolation"
msgstr ""
```

Output example without source files:
```
msgid "Filter custom interpolation"
msgstr ""
```

#### interpolation
Type: `Object`
Default value: `{ startDelimiter: '{{', endDelimiter: '}}' }`

Example: `{ startDelimiter: '[[', endDelimiter: ']]' }`

Use these interpolation delimiters instead of `{{` and `}}`. Should match the used interpolation delimiters in your angular application.

#### customRegex
Type: `Array<String>`
Default value: `[]`

Example: `customRegex: ['\\$translate\\s*:\\s*\'((?:\\\\.|[^\'\\\\])*)\'']`

An array containing custom regular expressions. Texts matching these expressions are extracted in addition to the usual extracted texts.

### Usage Examples

#### Default Options
In this example, the default options are used to extract texts to a pot file. All texts in *.js and *.html files are extracted to the file 'all_texts.pot'

```js
grunt.initConfig({
  angular_translate_extract: {
    default_options: {
      files: {
        'all_texts.pot': ['**/*.js', '**/*.html']
      }
    },
  },
});
```

#### Custom interpolation
In this example, custom interpolation delimiters are used. So, from a file containing `[[ 'text' | translate ]]`, "text" will be extracted.

```js
grunt.initConfig({
  angular_translate_extract: {
    default_options: {
      interpolation: {
        startDelimiter: '[[',
        endDelimiter: ']]'
      },
      files: {
        'custom_interpolation_texts.pot': ['**/*.js', '**/*.html']
      }
    }
  }
});
```

#### Custom regular expression
In this example, a custom regular expression is given. So, from a file containing `$translate: 'text'`, "text" will be extracted.

```js
grunt.initConfig({
  angular_translate_extract: {
    default_options: {
      customRegex: ['\\$translate\\s*:\\s*\'((?:\\\\.|[^\'\\\\])*)\''],
      files: {
        'custom_regex_texts.pot': ['**/*.js', '**/*.html']
      }
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
### 0.4.0
New option 'extractSourceFiles'.
Breaking change: Source files are extracted to output pot file now. If you don't want that, you have to add `extractSourceFiles: false` to your options.

### 0.3.0
POT file header added to output file.

### 0.2.0
Creating POT file containing texts used in source code with angular-translate.

### 0.1.0
First experimental version.
