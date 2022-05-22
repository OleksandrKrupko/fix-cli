const { Command } = require('commander');
const simpleGit = require('simple-git');
const standardVersion = require('standard-version');

const envsConfigs = require('./config');
const gitUtils = require('./utils/git');
const prompts = require('./utils/prompts');
const createFixPr = require('./createPr');

const git = simpleGit({
  progress({ method, stage, progress }) {
    console.log(`git.${method} ${stage} stage ${progress}% complete`);
  },
});

async function wait(delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const program = new Command();

async function main() {
  program
    .command('apply')
    .description('Split a string into substrings and display as an array')
    .action(async (str, options) => {
      const currentBranchName = await gitUtils.getCurrentBranchName();
      const fixCommitHash = await git.revparse({ HEAD: null });

      const envConfig = envsConfigs.find(config =>
        config.getTicketIdFromFixBranch(currentBranchName)
      );

      if (!envConfig) {
        throw new Error('No config for the specified fix branch');
      }

      const fixTicketId = envConfig.getTicketIdFromFixBranch(currentBranchName);

      if (!fixTicketId) {
        throw new Error('Cannot get ticket ID from the branch name');
      }

      if (envConfig.standardVersionBump) {
        console.log(
          `bumping the version of the main branch: ${currentBranchName}`
        );
        await standardVersion(envConfig.standardVersionBump);
      }

      try {
        console.log('trying to push the bumped version');
        await git.push();
      } catch (error) {
        if (gitUtils.isGitPushError(error)) {
          const isAllowForcePush = await prompts.askForForcePush();
          if (isAllowForcePush) {
            console.log('you allowed force push');
            await git.push({
              '-f': null,
            });
          } else {
            console.log('you didn`t allow force push');
            throw new Error('End of the script');
          }
        }
      }

      for (let envName of envConfig.applyFixForEnvs) {
        const envToApplyFixConfig = envsConfigs.find(
          config => config.name === envName
        );
        console.log('checkout to branch:', envToApplyFixConfig.branch);

        let envBaseBranch;
        if (envToApplyFixConfig.branch === 'ask') {
          envBaseBranch = await prompts.askForReleaseBranch();
        } else {
          envBaseBranch = envToApplyFixConfig.branch;
        }

        await git.checkout(envBaseBranch);
        await git.pull();
        const fixBranchName =
          envToApplyFixConfig.getFixBranchNameForTicketId(fixTicketId);
        console.log('Creating a new branch', fixBranchName);
        try {
          await git.checkoutLocalBranch(fixBranchName);
        } catch (error) {
          if (error.message.includes('already exists')) {
            const isRemoveExistingBranch =
              await prompts.askToDeleteExistingBranch(fixBranchName);

            if (isRemoveExistingBranch) {
              await git.deleteLocalBranch(fixBranchName, true);
              await git.checkoutLocalBranch(fixBranchName);
            }
          } else {
            throw error;
          }
        }

        try {
          try {
            console.log('cherry-picking the fix');
            await git.raw('cherry-pick', fixCommitHash);
          } catch (error) {
            console.log(
              'Error during the cherry-pick. You`ll need to cherry-pick your fix manually to this branch'
            );
            await git.raw('cherry-pick', '--abort');
            throw error;
          }

          if (envToApplyFixConfig.standardVersionBump) {
            console.log('bumping the version');
            await standardVersion(envToApplyFixConfig.standardVersionBump);
          }

          console.log(`creating a PR for branch: ${envBaseBranch}`);

          await createFixPr({
            fixBaseBranch: envBaseBranch,
          });
        } catch (error) {
          console.log(
            'error during fix apply. You`ll need to apply the fix to this branch manually'
          );
        }

        await wait(2000);
      }

      console.log(`Returning to the original fix branch: ${currentBranchName}`);

      await git.checkout(currentBranchName);
    });

  program
    .command('clean')
    .description('remove test branches')
    .action(async () => {
      const testTicketId = 'dc-777';

      for (let config of envsConfigs) {
        if (config.name !== 'PROD') {
          try {
            const branchName = config.getFixBranchNameForTicketId(testTicketId);
            console.log(`deleting ${branchName}`);
            await git.deleteLocalBranch(branchName, true);
          } catch (error) {
            console.log(error.message);
          }
        }
      }
    });

  await program.parseAsync();
}

main();
