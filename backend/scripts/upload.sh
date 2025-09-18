#!/bin/bash

rsync -avzP . root@174.138.37.91:

# CREATE TABLE bookmarks(
#     id SERIAL PRIMARY KEY,
#     title TEXT,
#     url TEXT,
#     timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
# );

# \copy bookmarks(title, url, timestamp, screenshot)
# FROM '/Users/stephenmatheis/GitHub/bookmarks/backend/data/bookmarks.csv'
# DELIMITER ','
# CSV HEADER;