version: 0.0.7

good resource:

```https://docs.github.com/en/get-started/using-git/about-git-subtree-merges```

update service with the last version of "master"

```git pull -s subtree common master```

update subtree from the main project

```git push origin `git subtree split --prefix=src/common`:master --force```
