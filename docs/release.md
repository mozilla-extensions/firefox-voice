# Releasing the Extension

To release...

## Production releases

- [ ] Update the version in `package.json` (the third numeral should always be `0`)
- [ ] Update the changelog with: `./bin/generate-commit-log --write recent`
- [ ] Edit `CHANGELOG.md` to enter the version and review the list of changes, removing uninteresting changes
- [ ] Commit the changes, `git commit -a -m "Update version with changelog"`
- [ ] Tag the version like `git tag vX.Y.0`
- [ ] Push the change and tags: `git push && git push --tags`
- [ ] Run `./bin/update-static-site.sh`
- [ ] Create a PR for master -> prod
- [ ] Land said PR
- [ ] Follow [some release docs](https://github.com/mozilla-extensions/xpi-manifest/blob/master/docs/releasing-a-xpi.md)
- [ ] Specifically connect to [shipit](https://shipit.mozilla-releng.net/newxpi) via the VPN
- [ ] "Build" [in shipit](https://shipit.mozilla-releng.net/xpi)
- [ ] Notify some people (in `#addons-pipeline` ?)
- [ ] Move it into place on the server and hand-update the JSON file
