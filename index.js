'use strict';

/***
    Usage: blogger2md <BLOGGER BACKUP XML> <OUTPUT DIR>

    Script to convert posts from Blogger to Markdown.

    - [ ] Read XML
    - [ ] Parse Entries (Posts and comments) (with xpath?)
    - [ ] Parse Title, Link, Created, Updated, Content, Link
    - [ ] List Post & Respective comment counts
    - [ ] Content to MD - pandoc?
    - [ ] Parse Images, Files, Videos linked to the post
    - [ ] Create output dir
    - [ ] List items that are not downloaded( or can't) along with their .md file for user to proceed


*/


const fs = require('fs');
const os = require('os');
const path = require('path');
const xml2js = require('xml2js');
const TurndownService = require('turndown')

var tds = new TurndownService()

// console.log(`No. of arguments passed: ${process.argv.length}`);

if (process.argv.length < 4){
    // ${process.argv[1]}
    console.log(`Usage: blogger2md <BLOGGER BACKUP XML> <OUTPUT DIR>`)
    return 1;
}


var outputDir = process.argv[3];

if (fs.existsSync(outputDir)) {
    console.log(`WARNING: Given output directory "${outputDir}" already exists. Files will be overwritten.`)
}
else{
    fs.mkdirSync(outputDir);
}




 
var parser = new xml2js.Parser();
// __dirname + '/foo.xml'
fs.readFile(process.argv[2], function(err, data) {
    parser.parseString(data, function (err, result) {
        // console.dir(JSON.stringify(result)); return;

        if(result.feed && result.feed.entry) {
            var contents = result.feed.entry;
            console.log(`Total no. of entries found : ${contents.length}`);
            // var i=0
            var posts = contents.filter(function(entry){
                // if (entry['thr:in-reply-to']){
                //     i++;
                //     return false;
                // }
                return entry.id[0].indexOf('.post-')!=-1 && !entry['thr:in-reply-to']
            });

            var comments = contents.filter(function(entry){
                return entry.id[0].indexOf('.post-')!=-1 && entry['thr:in-reply-to']
            });

            // console.dir(posts);

            console.log(`Content-posts ${posts.length}`);
            console.log(`Content-Comments ${comments.length}`);

             var content = '';
             var markdown = '';

            posts.forEach(function(entry){
                var title = entry.title[0]['_'];
                // title = tds.turndown(title);
                if (title && title.indexOf("'")){
                     title = title.replace(/'/g, "''");
                }
                
                // title = title.replace(/'/g, "\\'");
                // title = title.replace(/:/g, "\\:");
                // title = title.replace(/\[/g, '\\[');
                // title = title.replace(/\]/g, '\\]');
                var published = entry.published;
                var draft = 'false';

                console.log(`title: "${title}"`);
                console.log(`date: ${published}`);
                console.log(`draft: false`);
                
                var links = entry.link;

                var urlLink = entry.link.filter(function(link){
                    return link["$"].type && link["$"].rel && link["$"].rel=='alternate' && link["$"].type=='text/html'
                });

                var url=''

                // console.dir(urlLink[0]);
                if (urlLink && urlLink[0] && urlLink[0]['$'] && urlLink[0]['$'].href){
                    url = urlLink[0]['$'].href;
                    var fname = outputDir+'/'+path.basename(url);
                    fname = fname.replace('.html', '.md')
                    console.log(fname);

                    if (entry.content && entry.content[0] && entry.content[0]['_']){
                        // console.log('content available');
                        content = entry.content[0]['_'];
                        markdown = tds.turndown(content);
                        // console.log(markdown);

                        
                    }

                    var tagLabel = [];
                    var tags = [];

                    
                    tagLabel = entry.category.filter(function (tag){
                        // console.log(`tagged against :${tag['$'].term}`);
                        return tag['$'].term && tag['$'].term.indexOf('http://schemas.google')==-1;
                    });
                    console.log(`No of category: ${entry.category.length}`);
                    tagLabel.forEach(function(tag){
                        console.log(`tagged against :${tag['$'].term}`);
                        tags.push(tag['$'].term);
                    });

                    console.log(`tags : [${tags.join(', ')}]`);

                    var tagString=''
                    if(tags.length){
                        tagString=`tags : [${tags.join(', ')}]\n`;
                    }

                    console.log("\n\n\n\n\n");

                    const dest = fs.writeFile(fname, `---\ntitle: '${title}'\ndate: ${published}\ndraft: false\n${tagString}---\n${markdown}`, function(err){
                        if(err){
                            console.log(`Error while writing to ${fname} - ${err}`);
                            console.dir(err);
                        }
                        else{
                            console.log(`Successfully written to ${fname}`);
                        }
                    });
                }
                
            });
        }
        console.log('Done');
    });
});
