'use strict';

// Define plugin name.
const pluginName = 'plugin-node-tab';

// Load dependencies.
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const EOL = require('os').EOL;
const tab_loader = require('./src/tab-loader');

// Define helpers.
function writeConfigToOutput( patternlab, pluginConfig ) {

  let pluginConfigPathName = path.resolve(patternlab.config.paths.public.root, 'patternlab-components', 'packages');

  try {

    fs.outputFileSync(pluginConfigPathName + '/' + pluginName + '.json', JSON.stringify(pluginConfig, null, 2));

  } catch (ex) {

    console.trace(pluginName + ': Error occurred while writing pluginFile configuration');
    console.log(ex);

  }

}
function onPatternIterate( patternlab, pattern ) {

  tab_loader(patternlab, pattern);

}

/**
 * Define what events you wish to listen to here
 * For a full list of events - check out https://github.com/pattern-lab/patternlab-node/wiki/Creating-Plugins#events
 * @param patternlab - global data store which has the handle to the event emitter
 */
function registerEvents( patternlab ) {

  //register our handler at the appropriate time of execution
  patternlab.events.on('patternlab-pattern-write-end', onPatternIterate);

}

/**
* A single place to define the frontend configuration
* This configuration is outputted to the frontend explicitly as well as included in the plugins object.
*
*/
function getPluginFrontendConfig() {
  return {
    name: 'pattern-lab\/' + pluginName,
    templates: [],
    stylesheets: [],
    javascripts: ['patternlab-components\/pattern-lab\/' + pluginName + '\/js\/' + pluginName + '.js'],
    onready: 'PluginTab.init()',
    callback: ''
  };
}

/**
* The entry point for the plugin. You should not have to alter this code much under many circumstances.
* Instead, alter getPluginFrontendConfig() and registerEvents() methods
*/
function pluginInit( patternlab ) {

  // Create a helper for cleaner console logging.
  const log = (type, ...messages) => console[type](`${pluginName}:`, ...messages);

  // Exit if patterlab not set.
  if ( !patternlab ) {

    // Report error.
    log('error', 'patternlab object not provided to plugin-init');

    // Exit.
    process.exit(1);

  }

  // Get default plugin configurations.
  var pluginConfig = getPluginFrontendConfig();

  // Get project-specific plugin configurations.
  pluginConfig.tabsToAdd = patternlab.config.plugins[pluginName].options.tabsToAdd;

  // Write the plugin JSON to the `public/patternlab-components`.
  writeConfigToOutput(patternlab, pluginConfig);

  // Get the output path.
  var pluginConfigPathName = path.resolve(patternlab.config.paths.public.root, 'patternlab-components', 'packages');

  // Output configurations as JSON.
  try {

    fs.outputFileSync(pluginConfigPathName + '/' + pluginName + '.json', JSON.stringify(pluginConfig, null, 2));

  } catch (ex) {

    log('trace', 'Error occurred while writing pluginFile configuration');
    log('log', ex);

  }

  // Initialize patternlab plugins if no other plugins have been registered already.
  if( !patternlab.plugins ) patternlab.plugins = [];

  // Add the plugin configurations to the patternlab object.
  patternlab.plugins.push(pluginConfig);

  // Find plugin files.
  var pluginFiles = glob.sync(path.join(__dirname, '/dist/**/*'));

  // Load the plugin.
  if( pluginFiles && pluginFiles.length > 0 ) {

    // Get JS snippet.
    let tab_frontend_snippet = fs.readFileSync(path.resolve(__dirname + '/src/snippet.js'), 'utf8');

    // Load each plugin file.
    pluginFiles.forEach((pluginFile) => {

      // Make sure the file exists.
      if ( fs.existsSync(pluginFile) && fs.statSync(pluginFile).isFile() ) {

        // Get file paths.
        let relativePath = path.relative(__dirname, pluginFile).replace('dist', '');
        let writePath = path.join(patternlab.config.paths.public.root, 'patternlab-components', 'pattern-lab', pluginName, relativePath);

        // A message to future plugin authors:
        // Depending on your plugin's job, you might need to alter the dist file instead of copying.
        // If you are simply copying `dist` files, you can probably do the below:
        // fs.copySync(pluginFile, writePath);

        // In this case, we need to alter the `dist` file to loop through our tabs to load as defined in the `package.json`.
        // We are also being a bit lazy here, since we only expect one file.
        let tabJSFileContents = fs.readFileSync(pluginFile, 'utf8');

        // Initialize an empty string of parsed JS snippets.
        let snippetString = '';

        // Make sure some tabs should be parsed.
        if( pluginConfig.tabsToAdd && pluginConfig.tabsToAdd.length > 0 ) {

          // Parse the JS snippet for each tab.
          pluginConfig.tabsToAdd.forEach((lang) => {

            // Parse the snippet.
            let tabSnippetLocal = tab_frontend_snippet.replace(/<<type>>/g, lang).replace(/<<typeUC>>/g, lang.toUpperCase());

            // Save the snippet.
            snippetString += tabSnippetLocal + EOL;

          });

          // Generate the output file.
          tabJSFileContents = tabJSFileContents.replace('/*SNIPPETS*/', snippetString);

          // Save the output file for use in the browser.
          fs.outputFileSync(writePath, tabJSFileContents);

        }

      }

    });

  }

  // Setup listeners if not already active. We also enable and set the plugin as initialized.
  if( !patternlab.config.plugins ) patternlab.config.plugins = {};

  // Attempt to only register events once.
  if( patternlab.config.plugins[pluginName] !== undefined && patternlab.config.plugins[pluginName].enabled && !patternlab.config.plugins[pluginName].initialized ) {

    // Register events.
    registerEvents(patternlab);

    // Set the plugin initialized flag to `true` to indicate it is installed and ready.
    patternlab.config.plugins[pluginName].initialized = true;

  }

}

// Export.
module.exports = pluginInit;
