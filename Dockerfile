FROM docker.otenv.com/ot-node-6:latest

MAINTAINER MLP Team <multi-language@opentable.com>

ENTRYPOINT ["/usr/local/bin/node", "index.js"]