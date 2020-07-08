# Releasing the Extension

The extension should be released to **stage** when you push to the `stage` branch. Similarly it will be released to **production** when you push to the `prod` branch.

The release process is handled with [CircleCI](../.circleci/config.yml), with rules that run based on these branches.

## Production releases

- [ ] Update the version in `package.json` (the third numeral should always be `0`)
- [ ] Update the changelog with: `./bin/generate-commit-log --write recent`
- [ ] Edit `CHANGELOG.md` to enter the version and review the list of changes, removing uninteresting changes
- [ ] Commit the changes, `git commit -a -m "Update version with changelog"`
- [ ] Tag the version like `git tag vX.Y.0`
- [ ] Push the change and tags: `git push && git push --tags`
- [ ] Run `./bin/update-static-site.sh`
- [ ] Create a prod version of the extension with `npm run package-prod`
- [ ] Send the extension for review/signing
- [ ] Move it into place on the server and hand-update the JSON file

To fix issues:

- If a dev version of the add-on is built, but not a prod version, try rebuilding the CircleCI task named `build_prod`
- If the server isn't running, run `./update_xpi.sh` _on_ the `va.allizom.org` server
