const { Command } = require('commander');
const inquirer = require('inquirer');
const simpleGit = require('simple-git');

simpleGit().pull();

// const program = new Command();

// program
//   .name('string-util')
//   .description('CLI to some JavaScript string utilities')
//   .version('0.8.0');

// async function main() {
//   program
//     .command('split')
//     .description('Split a string into substrings and display as an array')
//     .argument('<string>', 'string to split')
//     .option('--first', 'display just the first substring')
//     .option('-s, --separator <char>', 'separator character', ',')
//     .action((str, options) => {
//       const limit = options.first ? 1 : undefined;
//       console.log(str.split(options.separator, limit));

//       inquirer
//         .prompt(
//           [{ name: 'test', message: 'Hey! Wanna give me some answers?' }],
//           {}
//         )
//         .then(answers => {
//           console.log('Your answers:', answers);
//         })
//         .catch(error => {
//           console.log('something went wrong!', error);
//         });
//     });

//   await program.parseAsync();
// }

// main();
