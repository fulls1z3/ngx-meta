import { readFile, readFileSync, writeFile } from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const inlineTemplate = (content: string, urlResolver: Function) =>
  content.replace(/templateUrl:\s*'([^']+?\.html)'/g, (m, templateUrl) => {
    const templateFile = urlResolver(templateUrl);
    const templateContent = readFileSync(templateFile, {encoding: 'utf-8'});
    const shortenedTemplate = (templateContent as string)
      .replace(/([\n\r]\s*)+/gm, ' ')
      .replace(/"/g, '\\"');

    return `template: "${shortenedTemplate}"`;
  });

const inlineStyle = (content: string, urlResolver: Function) =>
  content.replace(/styleUrls:\s*(\[[\s\S]*?\])/gm, (m, styleUrls) => {
    // tslint:disable-next-line
    const urls = eval(styleUrls);

    const res = urls.map((styleUrl: string) => {
      const styleFile = urlResolver(styleUrl);
      const styleContent = readFileSync(styleFile, {encoding: 'utf-8'});
      const shortenedStyle = (styleContent as string)
        .replace(/([\n\r]\s*)+/gm, ' ')
        .replace(/"/g, '\\"');

      return `"${shortenedStyle}"`;
    });

    return `styles: [${res}]`;
  });

const inlineResourcesFromString = (content: string, urlResolver: Function) => [
  inlineTemplate,
  inlineStyle
].reduce((res, fn) => fn(res, urlResolver), content);

function promiseify(fn: any): any {
  return function(): any {
    const args = [].slice.call(arguments, 0);

    return new Promise((resolve, reject) => {
      // tslint:disable-next-line
      fn.apply(this, args.concat([(err: any, value: any) => {
        if (err)
          reject(err);
        else
          resolve(value);
      }]));
    });
  };
}

const readFileAsync = promiseify(readFile);
const writeFileAsync = promiseify(writeFile);

export const inlineResources = (projectPath: string) => {
  const files = glob.sync('**/*.ts', {cwd: projectPath});

  return Promise.all(files
    .map((filePath: string) => {
      const fullFilePath = path.join(projectPath, filePath);

      return readFileAsync(fullFilePath, 'utf-8')
        .then((content: string) => inlineResourcesFromString(content,
          (url: string) => path.join(path.dirname(fullFilePath), url)))
        .then((content: string) => writeFileAsync(fullFilePath, content))
        .catch((err: string) => {
          console.error('An error occured: ', err);
        });
    }));
};
