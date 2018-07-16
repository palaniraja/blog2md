/***
    Usage: blogger2md <BLOGGER BACKUP XML> <OUTPUT DIR>

    Script to convert posts from Blogger to Markdown.

    - [ ] Read XML
    - [ ] Parse Entries (Posts and comments)
    - [ ] Parse Title, Link, Created, Updated, Content, Link
    - [ ] List Post & Respective comment counts
    - [ ] Content to MD - pandoc?
    - [ ] Parse Images, Files, Videos linked to the post
    - [ ] Create output dir
    - [ ] List items that are not downloaded( or can't) along with their .md file


*/


// console.log(`No. of arguments passed: ${process.argv.length}`);

if (process.argv.length < 4){
    // ${process.argv[1]}
    console.log(`Usage: blogger2md <BLOGGER BACKUP XML> <OUTPUT DIR>`)
    return 1;
}

