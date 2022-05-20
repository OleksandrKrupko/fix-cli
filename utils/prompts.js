const inquirer = require('inquirer');

module.exports = {
  askForReleaseBranch,
  askForForcePush,
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

async function askForForcePush() {
  return inquirer
    .prompt(
      [
        {
          name: 'forcePush',
          type: 'list',
          message:
            'Git needs to force push to the fix branch. Do you confirm the force push (Y/N)?',
          choices: ['Yes', 'No'],
          default: 'Yes',
        },
      ],
      {}
    )
    .then(answers => {
      return answers.forcePush === 'Yes' ? true : false;
    })
    .catch(error => {
      console.log('something went wrong!', error);

      throw error;
    });
}
