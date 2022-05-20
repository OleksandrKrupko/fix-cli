const simpleGit = require('simple-git');

module.exports = { getCurrentBranchName, isGitPushError };

async function getCurrentBranchName() {
  return await simpleGit().revparse({ '--abbrev-ref': null, HEAD: null });
}

function isGitPushError(error) {
  return error.message.includes('Integrate the remote changes');
}
