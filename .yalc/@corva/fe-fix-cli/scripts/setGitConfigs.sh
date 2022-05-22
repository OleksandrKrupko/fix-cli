#!/bin/sh

if test -f ".git/hooks/commit-msg.sample"; then
  rm .git/hooks/commit-msg.sample
fi

#run only when git repository exists
if [ -d .git ]; then
  git config commit.template scripts/COMMIT_TEMPLATE
  git config core.hooksPath .git-hooks
fi

