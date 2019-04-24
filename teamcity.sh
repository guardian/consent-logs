#!/bin/bash
set -e

npm install
# Will place .js files in dist
npm run build

# These also need to be in the RiffRaff package
cp package.json dist
cp package-lock.json dist
cp riff-raff.yaml dist
cp cfn.template.yaml dist

pushd dist
# Ensures the RiffRaff package has the node_modules needed to run
npm install --production
popd

npm run package
