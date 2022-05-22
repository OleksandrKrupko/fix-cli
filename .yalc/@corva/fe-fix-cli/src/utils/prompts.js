const inquirer = require('inquirer');

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
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
          default: 'Yes',
        },
      ],
      {}
    )
    .then(answers => {
      return answers.forcePush;
    });
}

async function askToDeleteExistingBranch(branchName) {
  return inquirer
    .prompt(
      [
        {
          name: 'deleteExistingBranch',
          type: 'list',
          message: `Branch ${branchName} already exists. Confirm deletion of this branch to create a new fix branch`,
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
          default: 'Yes',
        },
      ],
      {}
    )
    .then(answers => {
      return answers.deleteExistingBranch;
    });
}

module.exports = {
  askForReleaseBranch,
  askForForcePush,
  askToDeleteExistingBranch,
};
