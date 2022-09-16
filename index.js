#!/usr/bin/env node
const fs = require('fs');
const util = require('util');
const path = require('path');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

const TEMP_DIR = '___converted___';

const IDENTIFIERS = [' from ', ' import(', ' require(', 'import '];

const IGNORE = ['.DS_Store'];

const EXTENSIONS = ['.tsx', '.ts', '.js'];

function isLowerCased(str) {
  return str.toLowerCase() === str;
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function convertFileContent(content) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const identifier of IDENTIFIERS) {
      if (lines[i].includes(identifier) && !isLowerCased(lines[i])) {
        const parts = lines[i].split(identifier);
        const quote = parts[1].includes('"') ? '"' : "'";
        const path = parts[1].substring(parts[1].indexOf(quote), parts[1].lastIndexOf(quote));
        const convertedPath = toKebabCase(path);
        parts[1] = parts[1].replace(path, convertedPath);
        lines[i] = parts.join(identifier);
        break;
      }
    }
  }
  return lines.join('\n');
}

async function isGit() {
  try {
    await exec('git remote -v');
  } catch (_err) {
    return false;
  }
  return true;
}

function isDirExist(dir) {
  try {
    fs.statSync(dir);
  } catch (_err) {
    return false;
  }
  return true;
}

function kebabier(dir, rootDir) {
  let dirItems = fs.readdirSync(dir);
  dirItems = dirItems.filter((i) => !IGNORE.includes(i) && !IGNORE.includes(path.extname(i)));
  for (const item of dirItems) {
    const fullPath = path.join(dir, item);
    const itemStat = fs.statSync(fullPath);
    if (itemStat.isDirectory()) {
      kebabier(fullPath, rootDir);
    } else {
      const convertedDir = toKebabCase(dir);
      const destinationDir = convertedDir.replace(`${rootDir}/`, `${TEMP_DIR}/`);
      fs.mkdirSync(destinationDir, { recursive: true });
      const convertedFileName = toKebabCase(item);
      const newFullPath = path.join(destinationDir, convertedFileName);
      if (EXTENSIONS.includes(path.extname(item))) {
        console.log('\x1b[33m%s\x1b[0m', `Converting file content: ${fullPath}`);
        const content = fs.readFileSync(fullPath, 'utf8');
        const convertedContent = convertFileContent(content);
        fs.writeFileSync(newFullPath, convertedContent);
      } else {
        fs.copyFileSync(fullPath, newFullPath);
      }
      console.log('\x1b[36m%s\x1b[0m', `Renamed: ${fullPath} ===> ${newFullPath}`);
    }
  }
}

(async () => {
  try {
    const rootDir = process.argv[2];
    if (!rootDir) {
      throw new Error('A directory to refactor must be provider as command argument!');
    }
    if (!isDirExist(rootDir)) {
      throw new Error(`Directory ${rootDir} doesn't exists!`);
    }
    kebabier(`${rootDir}/`, rootDir);
    console.log('\x1b[36m%s\x1b[0m', `Renaming: ${TEMP_DIR} ===> ${rootDir}`);
    await exec(`rm -rf ${rootDir}`);
    if (await isGit()) {
      await exec('git add .');
      await exec(`git mv ${TEMP_DIR} ${rootDir}`);
    } else {
      await exec(`mv ${TEMP_DIR} ${rootDir}`);
    }
    console.log('\x1b[42m', 'Kebabier Complete!');
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
})();
