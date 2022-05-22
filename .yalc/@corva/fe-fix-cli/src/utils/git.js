const simpleGit = require('simple-git');

async function getCurrentBranchName() {
  return simpleGit().revparse({ '--abbrev-ref': null, HEAD: null });
}

function isGitPushError(error) {
  return error.message.includes('Integrate the remote changes');
}

module.exports = { getCurrentBranchName, isGitPushError };
