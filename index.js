'use strict';

/***
    Usage: blogger2md <BLOGGER BACKUP XML> <OUTPUT DIR>

    Script to convert posts from Blogger to Markdown.

    - [x] Read XML
    - [ ] Parse Entries (Posts and comments) (with xpath?)
    - [x] Parse Title, Link, Created, Updated, Content, Link
    - [ ] List Post & Respective comment counts
    - [x] Content to MD - pandoc?
    - [ ] Parse Images, Files, Videos linked to the posts
    - [x] Create output dir
    - [ ] List items that are not downloaded( or can't) along with their .md file for user to proceed


*/


const fs = require('fs');
const os = require('os');
const path = require('path');
const xml2js = require('xml2js');
const TurndownService = require('turndown');

var tds = new TurndownService()

// console.log(`No. of arguments passed: ${process.argv.length}`);

if (process.argv.length < 5){
    // ${process.argv[1]}
    console.log(`Usage: blogger2md [b|w] <BACKUP XML> <OUTPUT DIR>`)
    console.log(`\t b for parsing Blogger(Blogspot) backup`);
    console.log(`\t w for parsing Wordpress backup`);
    return 1;
}

var option = process.argv[2];
var inputFile =  process.argv[3];

var outputDir = process.argv[4];

if (fs.existsSync(outputDir)) {
    console.log(`WARNING: Given output directory "${outputDir}" already exists. Files will be overwritten.`)
}
else{
    fs.mkdirSync(outputDir);
}


if (fs.existsSync(outputDir+'/assets')) {
    console.log(`WARNING: assets directory "${outputDir+'/assets'}" already exists. Files will be overwritten.`)
}
else{
    fs.mkdirSync(outputDir+'/assets');
}


if( option.toLowerCase() == 'b'){
    bloggerImport(inputFile, outputDir);
}
else if(option.toLowerCase() == 'w'){
    wordpressImport(inputFile, outputDir);
}
else {
    console.log('Only b (Blogger) and w (Wordpress) are valid options');
    return;
}




function wordpressImport(backupXmlFile, outputDir){
    var parser = new xml2js.Parser();

    fs.readFile(backupXmlFile, function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log(`Error parsing xml file (${backupXmlFile})\n${JSON.stringify(err)}`); 
                return 1;
            }
            // console.dir(result); 
            // console.log(JSON.stringify(result));
            var posts = [];

            // try {
                posts = result.rss.channel[0].item;
                
                console.log(`Total Post count: ${posts.length}`);

                posts = posts.filter(function(post){
                    var status = '';
                    if(post["wp:status"]){
                        status = post["wp:status"].join(''); 
                    }
                    // console.log(post["wp:status"].join(''));
                    return status != "private" && status != "inherit" 
                });


                // console.log(posts)
                console.log(`Post count: ${posts.length}`);

                var title = '';
                var content = '';
                var tags = [];
                var published = '';
                var comments = [];
                var fname = '';
                var markdown = '';
                var fileContent = '';
                posts.forEach(function(post){
                    
                    title = post.title[0];
                    // console.log(title);

                    // if (title && title.indexOf("'")!=-1){
                    title = title.replace(/'/g, "''");
                    // }

                    published = post.pubDate;
                    comments = post['wp:comment'];
                    fname = post["wp:post_name"];
                    markdown = '';
                    // if (post.guid && post.guid[0] && post.guid[0]['_']){
                    //     fname = path.basename(post.guid[0]['_']);
                    // }
                    // console.log(comments);

                    console.log(`\n\n\n\ntitle: '${title}'`);
                    console.log(`published: '${published}'`);
                    
                    if (comments){
                        console.log(`comments: '${comments.length}'`);    
                    }
                    
                    tags = [];

                    var categories = post.category;
                    var tagString = '';

                    if (categories && categories.length){
                        categories.forEach(function (category){
                            // console.log(category['_']);
                            tags.push(category['_']);
                        });

                        // console.log(tags.join(", "));
                        // tags = tags.join(", ");
                        tagString = 'tags: [' + tags.join(", ") + "]\n";
                        // console.log(tagString);
                    }


                    fname = outputDir+'/'+fname+'.md';
                    console.log(`fname: '${fname}'`);

                    if (post["content:encoded"]){
                        // console.log('content available');
                        content = '<div>'+post["content:encoded"]+'</div>'; //to resolve error if plain text returned
                        markdown = tds.turndown(content);
                        // console.log(markdown);

                        fileContent = `---\ntitle: '${title}'\ndate: ${published}\ndraft: false\n${tagString}---\n${markdown}`;

                        writeToFile(fname, fileContent);
                        
                    }
                });

        });
    });

}





 
function bloggerImport(backupXmlFile, outputDir){
    var parser = new xml2js.Parser();
    // __dirname + '/foo.xml'
    fs.readFile(backupXmlFile, function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err){
                console.log(`Error parsing xml file (${backupXmlFile})\n${JSON.stringify(err)}`); return 1;
            }
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
                 var fileContent = '';

                posts.forEach(function(entry){
                    var title = entry.title[0]['_'];
                    // title = tds.turndown(title);
                    if (title && title.indexOf("'")!=-1){
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
                        var fname = outputDir + '/' + path.basename(url);
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


                        fileContent = `---\ntitle: '${title}'\ndate: ${published}\ndraft: false\n${tagString}---\n${markdown}`;

                        writeToFile(fname, fileContent)

                    }
                    
                });
            }
            console.log('Done');
        });
});

}



function writeToFile(filename, content){
    const dest = fs.writeFile(filename, content, function(err){
                            if(err){
                                console.log(`Error while writing to ${filename} - ${JSON.stringify(err)}`);
                                console.dir(err);
                            }
                            else{
                                console.log(`Successfully written to ${filename}`);
                            }
                        });
}