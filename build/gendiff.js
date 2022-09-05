import DiffFiles from "./Classes/DiffFiles.js";
const diff = new DiffFiles();
console.log(diff.generate('file1.json', 'file3.json'));
