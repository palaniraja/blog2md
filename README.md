# Blogger to Markdown

 Convert Blogger & Wordpress backup blog posts to hugo compatible markdown documents 


    Usage: blog2md b|w <BLOGGER BACKUP XML> <OUTPUT DIR>


Script to convert posts from Blogger to Markdown.

- [x] Read XML
- [x] Parse Entries (Posts and comments) (with xpath?)
- [x] Parse Title, Link, Created, Updated, Content, Link
- [ ] List Post & Respective comment counts
- [x] Content to MD - pandoc?
- [ ] Parse Images, Files, Videos linked to the posts
- [x] Create output dir
- [ ] List items that are not downloaded( or can't) along with their .md file for user to proceed
