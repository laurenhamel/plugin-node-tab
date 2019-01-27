# Tab Plugin for Pattern Lab Node

> This StyleguideKit is for Pattern Lab 2 and includes some upgrades that are not found in the original [pattern-lab/plugin-node-tab](https://github.com/pattern-lab/plugin-node-tab) repo. Use this package with [laurenhamel/styleguidekit-assets-default](https://github.com/laurenhamel/styleguidekit-assets-default) for improved code snippet highlighting.

The Tab Plugin allows Pattern Lab Node users to see sibling files next to a pattern in the filesystem, displaying them as additional tabs alongside the template and HTML tabs in both the Style Guide frontend and the single-pattern info modal.

[Read more about Pattern Lab Node Plugins](https://github.com/pattern-lab/patternlab-node/wiki/Creating-Plugins)

## Installation

To add the Tab Plugin to your project using [npm](http://npmjs.com/) type:

    npm install laurenhamel/plugin-node-tab --save

Or add it directly to your project's `package.json` file and run `npm install`

During installation, the plugin is added as a key to the `plugins` object in your main Pattern Lab project's `patternlab-config.json` file

> If you don't see this object, try running `npm run postinstall` within the root of your project.

## Configuration

Post-installation, you will see the following in your `patternlab-config.json`:

Example:

```
"plugins": {
  "plugin-node-tab": {
    "enabled": true,
    "initialized": false,
    "options": {
      "tabsToAdd": []
    }
  }
}
```

Add file extensions to this array as strings. Example: `"tabsToAdd": ["scss", "js"]`. You are all set now.

## Expected Structure

With the Tab Plugin installed, you can now accompany pattern template files with the file types of your choice and expect Pattern Lab to show them as tabs. The file structure would be similar to that of `pattern.json` or `pattern.md` files, except that it will be `pattern.<<type>>`.

For example, if we added an `scss` tab:

```
./_patterns/foo/bar
├── pattern.mustache (the pattern template)
├── pattern.md (optional pattern-specific documentation and metadata)
├── pattern.json (optional pattern-specific data)
└── pattern.scss (a file matching the tab you added.)
```

## Enabling / Disabling the Plugin

After install, you may manually enable or disable the plugin by finding the `plugin-node-tab` key within your main Pattern Lab project's `patternlab-config.json` file and setting the `enabled` flag. In the future this will be possible via CLI.
