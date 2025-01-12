# Goodreads Statuses Backup Script

*Export user statuses from Goodreads, using Google Apps Script.*

This script can be used to automatically export a user's statuses, including
reading progress, as JSON. They are stored in a specified Google Drive
directory, where they can be easily downloaded or shared.

## Usage

This script is designed to be run on-demand via the GAS interface, or
periodically via GAS triggers. For more info on setting up GAS triggers, see
[this Google Apps Script guide](https://developers.google.com/apps-script/guides/triggers).

To execute the script, simply run the `main()` function.

**NOTE**: The user's statuses must be set to public. This script only scrapes
          public pages, so private statuses can't be backed up.

## Setup

There are two basic steps necessary to run this script.

1. [Customize your config file](#1.-Customize-your-config-file)
2. [Load the script into a new Google Apps Script project](#2.-Load-the-script-into-a-new-Google-Apps-Script-project)

### 1. Customize your config file

`config.js` should contain a single JavaScript object, used to specify all
necessary configuration information. Here's where you specify the user, the
desired format(s), as well as the Google Drive directory to save exported
files to.

An example version is provided, named `example.config.js`, which can be
renamed or copied to `config.js` before loading into the GAS project.

The basic structure can be seen below.

```js
const config = {
    "userId":  "<Goodreads user ID>",
    "backupDir": "<Google Drive directory ID>"
};
```

- `userId`: User ID of the Goodreads user whose data is being exported.
    This is the 8-digit number that can be found in the URL of the user's
    profile page.
- `backupDir`: The ID of the Google Drive directory, where exported data
    should be stored. This can be found by navigating to the folder, and
    grabbing the ID from the tail of the URL.

### 2. Load the script into a new Google Apps Script project

You can manually load the script into a
[new GAS project](https://www.google.com/script/start/),
by simply copying and pasting it into the editor.

Or you can use a
[tool like clasp](https://developers.google.com/apps-script/guides/clasp)
to upload it directly. For more information on using clasp, here is a
[guide I found useful](https://github.com/gscharf94/Clasp-Basics-for-Reddit).
