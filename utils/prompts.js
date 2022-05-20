const inquirer = require('inquirer');

module.exports = {
  askForReleaseBranch,
};

async function askForReleaseBranch() {
  return inquirer
    .prompt(
      [
        {
          name: 'branch',
          message: 'Type release branch name',
        },
      ],
      {}
    )
    .then(answers => {
      console.log('you selected the release branch:', answers.branch);

      return answers.branch;
    })
    .catch(error => {
      console.log('something went wrong!', error);

      throw error;
    });
}
