"use strict";

const fs = require('fs-extra');
const path = require('path');

/**
 * The backend method that is called during the patternlab-pattern-write-end event.
 * Responsible for looking for a companion filetype file alongside a pattern file and outputting it if found.
 * @param patternlab - the global data store
 * @param pattern - the pattern object being iterated over
 */
function findTab(patternlab, pattern) {

  // Read the file types from the configuration.
  const fileTypes = patternlab.config.plugins['plugin-node-tab'].options.tabsToAdd.map((fileType) => fileType.toLowerCase());

  // Initialize a helper for cleaner console logging.
  const log = (type, ...messages) => console[type]('plugin-node-tab:', ...messages);

  // Exit if either of these two parameters are missing.
  if( !patternlab || !pattern ) {

    // Report error.
    log('error', !patternlab ? 'patternlab' : 'pattern', 'object not provided to findTab');

    // Exit.
    process.exit(1);

  }

  // Get the pattern extension.
  const patternExt = patternlab.config.patternExtension;

  // Derive the custom file type paths from the pattern's path.
  let customFileTypePath = path.join(patternlab.config.paths.source.patterns, pattern.relPath).replace(new RegExp('\\.' + patternExt + '$'), '');

  // Loop through all configured types.
  fileTypes.forEach((fileType) => {

    let tabFileName = path.resolve(`${customFileTypePath}.${fileType}`);
    let tabFileNameOutput = path.resolve(patternlab.config.paths.public.patterns, pattern.getPatternLink(patternlab, 'custom', `.${fileType}`));

    // Look for a custom file type for this template.
    if( fs.existsSync(tabFileName) && fs.statSync(tabFileName).isFile() ) {

      // Debug.
      if( patternlab.config.debug ) log('log', `copied pattern-specific ${fileType} file for ${pattern.patternPartial}`);

      // Copy the file to our output target if found.
      fs.copySync(tabFileName, tabFileNameOutput, {overwrite: true});

    }

    // Otherwise, use an empty file instead to prevent errors.
    else {

      // Debug
      if( patternlab.config.debug ) log('log', `empty ${fileType} file for ${pattern.patternPartial} to prevent \'GET\' error`);

      // Write the empty file.
      fs.outputFileSync(tabFileNameOutput, '');

    }

  });

}

module.exports = findTab;
