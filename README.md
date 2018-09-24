
# d2l-html-editor

[![Build Status](https://travis-ci.com/Brightspace/d2l-html-editor.svg?token=z1N1ibLo45u7EF4sGt3Y&branch=master)](https://travis-ci.com/Brightspace/d2l-html-editor)

An element wrapping TinyMCE.

## Dependencies

Element dependencies are managed via [Bower](http://bower.io/). You can
install that via:

    npm install -g bower

Then, go ahead and download the element's dependencies:

    bower install


## Playing With Your Element

If you wish to work on your element in isolation, we recommend that you use
[Polyserve](https://github.com/PolymerLabs/polyserve) to keep your element's
bower dependencies in line. You can install it via:

    npm install -g polyserve

And you can run it via:

    polyserve

Once running, you can preview your element at
`http://localhost:8080/components/d2l-html-editor/`, where `d2l-html-editor` is the name of the directory containing it.


## Usage
### Using in a iframe based FRA vs in the LMS
This web component was originally created for using in iframe based Free Range Apps and makes heavy use of ifrau services to utilize services and helper dialogs in the LMS.  It is in the process of being enhanced for use web components embedded directly in the LMS. To facilitate this it uses two different client implementations (ifrau client vs LMS client) to abstract access to these services and dialogs.

When running in a FRA import the standard ifrau client.

```html
    <link rel='import' href='../bower_components/d2l-html-editor/d2l-html-editor-client-framed.html' />
```

When running in the LMS import the LMS client abstraction.

```html
    <link rel='import' href='../bower_components/d2l-html-editor/d2l-html-editor-client.html' />
```

Note: The LMS client abstraction currently only supports getting the Brightspace UI host and HTML filtering on initialization. So this means you are limited to using only basic, standard TinyMCE editing capabilities. e.g. bold, italic, underline, lists, emoticons). More features will be added to the LMS client abstraction over time to allow launching things like Quicklinks, Insert Stuff, images etc.

###Import
```html
<head>
    <link rel='import' href='../bower_components/d2l-html-editor/d2l-html-editor.html' />
</head>
```

###HTML
```html
<d2l-html-editor
	editor-id="unique-id"
    app-root="http://hostname/bower_components/dir/"
    lang-tag="en-US"
    content="show this text in editor on load">
    <div
        class='d2l-richtext-editor-container'
        id="unique-id"
        role="textbox">
    </div>
</d2l-html-editor>
```
To include a placeholder, ensure `d2l_placeholder` is included in the plugins property. Then, include the placeholder attribute
```html
<d2l-html-editor
	editor-id="unique-id"
    app-root="http://hostname/bower_components/dir/">
    <div
        id="unique-id"
        placeholder$="Placeholder text">
    </div>
</d2l-html-editor>
```

### Attributes
* `inline` - Render inline
* `auto-focus` - Focus when rendered
* `min-rows` - Minimum rows to display (in rows)
* `max-rows` - Maximum rows to display (in rows)
* `total-padding` - Padding inside input area
* `line-height` - Line-height of text inside input area
* `editor-id` - A unique Id (must be unique for each editor on a page)
* `content` - Default value to display in the editor
* `base-url` - Root directory where TinyMCE is located
* `document-base-url` - base URL for all relative URLs in the document
* `css-url` - URL of CSS file containing styles to include (non-inline only)
* `app-root` - Location of the app
* `lang-available` - Object specifying whether the language is available
* `lang-tag` - The locale, for example, `en-US`
* `lang-dir` - Language direction. Either `ltr` (default) or `rtl`.
* `image-tools-enabled` - Enable image tools
* `power-paste-enabled` - Enable power paste
* `power-paste-formatting` - Filter type for powerpaste plugin
* `a11ychecker-enabled` - Enable a11ychecker
* `allow-unsafe` - Allow script tags
* `full-page-enabled` - Enable 'd2l_fullpage' plugin
* `auto-focus-end` - On autofocus, set cursor to end of input
* `toolbar` - Override default buttons to show on toolbar. e.g. `'bold | italic underline'` Use `|` to place a divider.
* `plugins` - Override default plugins to include. e.g. `'autolink lists paste d2l_placeholder'`
* `default-fullpage-font-family` - Default fullpage font family
* `default-fullpage-font-size` - Default fullpage font size
* `object-resizing` - Enables/Disables inline resizing controls of tables and images

### Adding a new plugin behaviors file
1. Add file to root folder and import in `d2l-html-editor.html`. e.g. `<link rel="import" href="d2l-filter-plugin.html">`
2. In the `d2l-html-editor.js` file `_getPluginBehavior` function, add a new case to the switch statement
3. Then ensure the `this.plugins` property includes that plugin name somewhere in the string.


## Testing Your Element

Simply navigate to the `/test` directory of your element to run its tests. If
you are using Polyserve: `http://localhost:8080/components/d2l-html-editor/test/`

### web-component-tester

The tests are compatible with [web-component-tester](https://github.com/Polymer/web-component-tester).
Install it via:

    npm install -g web-component-tester

Then, you can run your tests on _all_ of your local browsers via:

    wct

#### WCT Tips

`wct -l chrome` will only run tests in chrome.

`wct -p` will keep the browsers alive after test runs (refresh to re-run).

`wct test/some-file.html` will test only the files you specify.
