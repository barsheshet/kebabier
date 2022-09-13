# kebaby (Alpha)

## What is this?

Kebaby is a command line tool that helps refactor js(x)/ts(x) projects into kebab-case files and directories.

## Why?

Well, because macOS is a case-insensitive file system by default.
So, when renaming `myComponent.js` into `MyComponent.js`, Git won't pick up the change in the file name.

Locally, everything may work just fine. but, other systems, for example, GitHub CI, will break complaining `MyComponent.js` doesn't exist 😕.

People actually suffer from it! [here](https://twitter.com/kentcdodds/status/1249870276688371713?lang=en)

Other than that, there are pros to using kebab-case: [here](https://www.reddit.com/r/javascript/comments/bfavm7/i_switched_to_all_lowercase_file_names_and_i_love/)

## How to use it?

`npx kebaby <directory name>`

Kebaby will kebab-case all ts(x)/js(x) files, directories, and sub-directories 🚀.
