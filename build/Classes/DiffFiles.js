import * as path from 'path';
import * as fs from 'fs';
//import * as _ from 'lodash';
//import yaml from 'js-yaml';
export default class DiffFiles {
    constructor() {
        this.formates = ['json', 'yml', 'yaml'];
        this.parsers = {
            json(data) { return JSON.parse(data); },
            //yaml(data: string): object { return yaml.load(data) }
        };
    }
    getDiff(dataOfFiles) {
        const [firstObj, secondObj] = dataOfFiles;
        const keys = [...Object.keys(firstObj), ...Object.keys(secondObj)];
        const diff = keys.reduce((acc, key) => {
            const firstItem = firstObj[key];
            const secondItem = secondObj[key];
            if ((typeof firstItem === 'object' && firstItem !== null) && (typeof secondItem === 'object' && secondItem !== null)) {
                acc[key] = this.getDiff([firstItem, secondItem]);
                return acc;
            }
            ;
            if (secondObj.hasOwnProperty(key)) {
                if (firstObj.hasOwnProperty(key)) {
                    const isChanged = firstItem === secondItem ? false : true;
                    if (isChanged) {
                        acc[`- ${key}`] = firstItem;
                        acc[`+ ${key}`] = secondItem;
                    }
                    else {
                        acc[key] = firstItem;
                    }
                }
                else {
                    acc[`- ${key}`] = secondItem;
                }
            }
            else {
                if (firstObj.hasOwnProperty(key))
                    acc[`- ${key}`] = firstItem;
            }
            ;
            return acc;
        }, {});
        return diff;
    }
    parse(data, currentFormat) {
        const parsed = this.formates.reduce((acc, format) => {
            if (currentFormat === format)
                acc = this.parsers[format](data);
            return acc;
        }, {});
        return parsed;
    }
    getFullPath(filename) {
        return path.resolve('src/__fixtures__', filename);
    }
    generate(firstFilename, secondFilename) {
        const files = [firstFilename, secondFilename].map(filename => {
            const format = filename.split('.')[filename.split('.').length - 1];
            const path = this.getFullPath(filename);
            const data = fs.readFileSync(path, 'utf8');
            const parsedData = this.parse(data, format);
            return parsedData;
        });
        const result = this.getDiff(files);
        return JSON.stringify(result, null, 4);
    }
}
