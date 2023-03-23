#!/bin/bash

set -e
set -o xtrace

npx firebase deploy --only functions:user --project prod
npx firebase deploy --only functions:ceremony --project prod
npx firebase deploy --only functions:participant --project prod
npx firebase deploy --only functions:circuit --project prod
npx firebase deploy --only functions:storage --project prod
npx firebase deploy --only functions:timeout --project prod
