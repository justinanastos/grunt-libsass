/*
 * grunt-libsass
 * https://github.com/project-collins/grunt-libsass
 *
 * Copyright (c) 2014 Andrew Smith
 * Licensed under the MIT license.
 */

'use strict';

var
    libsass = require('node-sass'),
    chalk = require('chalk'),
    Q = require('q');


module.exports = function(grunt) {

    function makeSuccessFn(file, deferred) {
        return function (css) {
            grunt.file.write(file.dest, css);
            grunt.log.writeln('Wrote file: ' + chalk.green(file.dest));
            deferred.resolve(true);
        };
    }


    function makeErrorFn(deferred) {
        return function (error) {
            deferred.reject(error);
        };
    }


    function makeRenderOpts(file, deferred) {
        return {
            file: file.src,
            success: makeSuccessFn(file, deferred),
            error: makeErrorFn(deferred)
        };
    }


    function checkSource(src) {
        if(src.length >= 1 && grunt.file.exists(src[0])) {
            return true;
        }

        throw new Error(src + ' does not exist!');
    }


    function renderFileGroup(file) {
        var deferred = Q.defer();

        if(checkSource(file.src)) {
            libsass.render(makeRenderOpts(file, deferred));
        }

        return deferred.promise;
    }


    grunt.registerMultiTask('libsass', 'Fast grunt sass compiler using libsass via node-sass', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            punctuation: '.',
            separator: ', '
        });

        var done = this.async();

        Q.all(this.files.map(renderFileGroup))

        .then(function () {
            done();
        })

        .catch(function (error) {
            grunt.warn(error);
        });
    });
};
