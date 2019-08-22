# Releasing the Extension

The extension should be released to **stage** when you push to the `stage` branch. Similarly it will be released to **production** when you push to the `prod` branch.

The release process is handled with [CircleCI](../.circleci/config.yml), with rules that run based on these branches.
