hns files are just text files where each line is some abstracted html element

any element can be anywhere in an hns file, but I usually put them in the order:

I am an idiot so I delimited stuff using a colon (:). if you actually want a colon like in text, use &colon;
you can use html anywhere there is going to be text. I am aware of how insecure that is.

meta stuff:
title
user
background-color or background
music
[list of elements]


here's the list of elements that exist:

meta:
title: the title of the webpage. shown just under the url bar
user: the user who created the webpage. should be the same for a page and its subpages
background-color: the color applied to the entire body background. defaults to #222034
background: the style for the background. more versatile than background-color
music: the url of the music to use, relative to the root of the website directory

elements:

i - image
l - listing item (on main page)
s - status (of user, at the top of page)
p - padding
t - text
trgb - text with gamer rgb effect. not sure if it works, I don't think I'm using it anywhere
tp - pulsing text like in the "submissions closed"  in discussion den
tm - marquee / scrolling text
trgbm - marquee but rgb. again not sure if it works
tpm - marquee but pulsing
ti - text with image to the left or right
tdc - double column text like on joe's page
hr - horizontal line spanning the page
d - discussion element
dc - discussion comment

element parameters (delimited by colon)

i:left offset:top offset:width:height:src:alt text:link (optional)
l:background color:view box color:view box border color:title:user:description:url
s:stamp/emote:status // this doesn't require a user to be put in because that's just text above the box
p:inline or block:width:height
t:font:size:align left/center/right/justified:color:text content
trgb:font:size:align left/center/right/justified:text content
tp:font:size:align:color1:color2:text content
tm:font:size:align left/center/right/justified:color:text content
trgbm:font:size:align left/center/right/justified:text content
tpm:font:size:align:color1:color2:text content
ti:side of text left/right:text size:text align left/center/right/justified:color:text content:img source:link (optional)
tdc:font:size:align left/center/right/justified:color:left text content:right text content
hr:color
d:image:title:user:id:comment count:stamp // stamp doesn't do anything. if comment count is empty, will show # UNDEFINED # and be unclickable
dc:user:text content

