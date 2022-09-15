# Kebabier 🍢 (Beta)

## What is this?

Kebabier is a minimal, lean, and zero dependency CLI tool that helps refactor JavaScript/TypeScript projects to use [kebab-case naming convention](https://en.wikipedia.org/wiki/Letter_case#Kebab_case) for files & folders.

## Why?

Well, because macOS is a case-insensitive file system by default.
So when renaming `myComponent.js` into `MyComponent.js`, Git won't pick up the change in the file name.

Locally, everything may work just fine. but, other systems, for example, your GitHub Actions CI, will break complaining `MyComponent.js` doesn't exist 😕.

People really encounter this issue! [look](https://twitter.com/kentcdodds/status/1249870276688371713?lang=en)

Other than that, [there are many advantages of using kebab-case naming convention.](https://www.reddit.com/r/javascript/comments/bfavm7/i_switched_to_all_lowercase_file_names_and_i_love/)

## How to Use?

`npx kebabier <directory name>`

Kebabier will kebab-case all ts(x)/js(x) files, directories, and sub-directories 🚀.
It will also update all `import` (including dynamic) & `require` to use the correct path.  
When inside a git project, it will also re-index the files to make sure git will pick up the changes.

## Example Usage

`npx kebabier src`

Will convert all files and directories inside `src` directory.
