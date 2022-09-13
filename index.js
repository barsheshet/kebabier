#!/usr/bin/env node
const fs = require('node:fs/promises');
const util = require('node:util');
const path = require('node:path');
const childProcess = require('node:child_process');

const exec = util.promisify(childProcess.exec);

let rootDir = undefined;

const tempDir = '___converted___';

const identifiers = [' from ', ' import(', ' require(', 'import '];

const ignore = ['.DS_Store'];

const extensions = ['.tsx', '.ts', '.js'];

const toKebabCase = (str) =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const convertFileContent = (content) => {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < identifiers.length; j++) {
      if (lines[i].includes(identifiers[j])) {
        const parts = lines[i].split(identifiers[j]);
        const quote = parts[1].includes('"') ? '"' : "'";
        const path = parts[1].substring(parts[1].indexOf(quote), parts[1].lastIndexOf(quote));
        const convertedPath = toKebabCase(path);
        parts[1] = parts[1].replace(path, convertedPath);
        lines[i] = parts.join(identifiers[j]);
        break;
      }
    }
  }
  return lines.join('\n');
};

async function kebaby(dir) {
  let dirItems = await fs.readdir(dir);
  dirItems = dirItems.filter((i) => !ignore.includes(i) && !ignore.includes(path.extname(i)));
  for (const item of dirItems) {
    const fullPath = path.join(dir, item);
    const itemStat = await fs.stat(fullPath);
    if (itemStat.isDirectory()) {
      kebaby(fullPath);
    } else {
      const convertedDir = toKebabCase(dir); // Foo/Bar/FooBar/ ==> foo/bar/foo-bar/
      const destinationDir = convertedDir.replace(`${rootDir}/`, `${tempDir}/`); // <rootDir>/bar/foo-bar/ ==> ___converted___/bar/foo-bar
      await fs.mkdir(destinationDir, { recursive: true });
      const convertedFileName = toKebabCase(item); // BarZaz.tsx ==> bar-zaz.tsx
      if (extensions.includes(path.extname(item))) {
        const content = await fs.readFile(fullPath, 'utf8');
        const convertedContent = convertFileContent(content);
        await fs.writeFile(path.join(destinationDir, convertedFileName), convertedContent);
      } else {
        await fs.copyFile(fullPath, path.join(destinationDir, convertedFileName));
      }
    }
  }
}

(async () => {
  try {
    rootDir = process.argv[2];
    if (!rootDir) {
      throw new Error('A directory to refactor must be provider as command argument!');
    }
    try {
      await fs.stat(rootDir);
    } catch {
      throw new Error(`Directory ${rootDir} doesn't exists!`);
    }
    await kebaby(`${rootDir}/`);
    await exec(`rm -rf ${rootDir}`);
    await exec(`git add .`);
    await exec(`git mv ${tempDir} ${rootDir}`);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
