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

const PROGRESS_STATUS = {
  CHERRY_PICK_CONFLICT: 'CHERRY_PICK_CONFLICT',
  FIX_BRANCH_PUSHED: 'FIX_BRANCH_PUSHED',
  LOCAL_FIX_BRANCH_CREATED: 'LOCAL_FIX_BRANCH_CREATED',
  PR_CREATED: 'PR_CREATED',
};

const program = new Command();

async function main() {
  program
    .command('apply')
    .description('Split a string into substrings and display as an array')
    .action(async (str, options) => {
      const mainFixBranch = await gitUtils.getCurrentBranchName();
      const fixCommitHash = await git.revparse({ HEAD: null });

      const mainFixEnvConfig = envsConfigs.find(config =>
        config.getTicketIdFromFixBranch(mainFixBranch)
      );

      if (!mainFixEnvConfig) {
        console.error(
          `Current branch name doesn't match any envs listend in the config file`
        );
        process.exit(1);
      }

      const fixTicketId =
        mainFixEnvConfig.getTicketIdFromFixBranch(mainFixBranch);

      if (!fixTicketId) {
        console.error('Cannot get ticket ID from the branch name');
        process.exit(1);
      }

      if (mainFixEnvConfig.standardVersionBump) {
        console.log(`bumping the version of your fix branch: ${mainFixBranch}`);
        await standardVersion(mainFixEnvConfig.standardVersionBump);
      }

      try {
        console.log(`trying to push your fix branch: ${mainFixBranch}`);
        await git.push();
      } catch (error) {
        if (gitUtils.isGitPushError(error)) {
          const isAllowForcePush = await prompts.askForForcePush();

          if (isAllowForcePush) {
            console.log('you allowed force push. Pushing...');
            await git.push({
              '-f': null,
            });
          } else {
            console.error(
              `your fix branch ${mainFixBranch} wasn't force pushed. You'll need to push it manually`
            );
          }
        }
      }

      for (let envName of mainFixEnvConfig.applyFixForEnvs) {
        try {
          const envToApplyFixConfig = envsConfigs.find(
            config => config.name === envName
          );
          console.log('checkout to env branch:', envToApplyFixConfig.branch);

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
          console.log('Creating a new fix branch', fixBranchName);

          try {
            await git.checkoutLocalBranch(fixBranchName);
          } catch (error) {
            if (error.message.includes('already exists')) {
              const isRemoveExistingBranch =
                await prompts.askToDeleteExistingBranch(fixBranchName);

              if (isRemoveExistingBranch) {
                await git.deleteLocalBranch(fixBranchName, true);
                await git.checkoutLocalBranch(fixBranchName);
              } else {
                console.log(
                  `You refused to delete existing branch with the same name. New fix branch ${fixBranchName} wasn't created`
                );
              }
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
              console.log(`bumping the version of ${fixBranchName} branch`);
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
        } catch (error) {
          console.error('Unknown error occured: ', fixBranchName);
        }

        await wait(2000);
      }

      console.log(`Returning to the original fix branch: ${mainFixBranch}`);

      await git.checkout(mainFixBranch);
    });

  await program.parseAsync();
}

main();
