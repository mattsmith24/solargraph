#!/bin/bash

(cd solargraph_api && cargo build -r)
sudo cp solargraph-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable solargraph-api
sudo systemctl restart solargraph-api

(cd solargraph && npm run build)
sudo cp solargraph.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable solargraph
sudo systemctl restart solargraph
