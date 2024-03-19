import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const fields = [
  'name',
  'version',
  'main',
  'author',
  'contributors',
  'description',
  'license',
  'repository',
  'keywords',
  'dependencies',
];

fs.writeFileSync(
  'dist/package.json',
  JSON.stringify(
    fields.reduce((acc, field) => {
      acc[field] = pkg[field];
      return acc;
    }, {}),
    null,
    2,
  ),
);
