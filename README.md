# Blogger to Markdown

 Convert Blogger & Wordpress backup blog posts to hugo compatible markdown documents 


    Usage: node index.js b|w <BLOGGER BACKUP XML> <OUTPUT DIR>

For Blogger imports, blog posts and comments (as seperate file `<postname>-comments.md`) will be created in "`out`" directory

```
    node index.js b your-blogger-backup-export.xml out
```

For Wordpress imports, blog posts and comments (as seperate file `<postname>-comments.md`) will be created in "`out`" directory

```
    node index.js w your-wordpress-backup-export.xml out
```

## Installation

* Download/Clone this project
* `cd` to directory
* Run `npm install` to install dependencies
* Run `node index.js <arg...>`


Script to convert posts from Blogger to Markdown.

- [x] Read XML
- [x] Parse Entries (Posts and comments) (with xpath?)
- [x] Parse Title, Link, Created, Updated, Content, Link
- [ ] List Post & Respective comment counts
- [x] Content to MD - pandoc?
- [ ] Parse Images, Files, Videos linked to the posts
- [x] Create output dir
- [ ] List items that are not downloaded( or can't) along with their .md file for user to proceed
