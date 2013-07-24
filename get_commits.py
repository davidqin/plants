# -*- coding: utf-8 -*-
# coding: UTF-8

from pygit2 import (
    Repository,
    GIT_SORT_TIME,
    GIT_SORT_REVERSE,
    GIT_DIFF_REVERSE
)

REPO_PATH = '/data/home/xutao/happyday/code'
MOVIE_PATH = '/data/home/xutao/happyday/movie'

repo = Repository(REPO_PATH)
commit = repo.revparse_single('HEAD')
walker = repo.walk(commit.oid, GIT_SORT_TIME | GIT_SORT_REVERSE)
commits = {}
commits['additions'] = 0
commits['deletions'] = 0
commits['files'] = 0
for c in walker:
    if len(c.parents) > 1:
        continue
    if len(c.parents) == 0:
        opt = GIT_DIFF_REVERSE
        diff = c.tree.diff(flags=opt, empty_tree=True)
    else:
        diff = c.parents[0].tree.diff(c.tree)
    print diff
    patches = [p for p in diff]
    additions = 0
    deletions = 0
    changed_files = len(patches)
    for p in patches:
        additions += p.additions
        deletions += p.deletions
    commits['additions'] += additions
    commits['deletions'] += deletions
    commits['files'] = changed_files
    print c.hex, c.author.email, c.author.name.encode("gbk", "ignore"), changed_files
