from BeautifulSoup import BeautifulSoup as soup
import lxml.html as html
import sys
import os
import urllib
import urllib2
import urlparse
import subprocess
import cPickle
import re

def download_webpage(url, num_tries=5):
    for i in xrange(num_tries):
        p = subprocess.Popen(["wget", url], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        streamoutput = p.communicate()
        rc = p.returncode
        if rc != 0:
            print "Try %d failed, trying again...\n" % (i + 1)
            continue
        s = streamoutput[1].split("\n")[-3]
        s = s[s.find('`') + 1:]
        s = s[:s.find('\'')]
        return s


def download_tv_show_list():
    tv_shows = []
    doc = html.parse("http://www.tvsubtitles.net/tvshows.html")
    list_tr = doc.xpath("//table[@id='table5']/tr")[1:]
    for tr in list_tr:
        cols = [x.text_content() for x in tr.xpath("./td")]
        a = tr.xpath("./td/a")[0]
        link = a.attrib['href']
        show_id = re.match(r'tvshow-(.+?)-.*?\.html', link).group(1)
        tv_shows.append({"name": unicode(cols[1]), "seasons":  unicode(cols[2]), "episodes":  unicode(cols[3]), "year": unicode(cols[5]), 'show_id': unicode(show_id)})
    return tv_shows


def get_tv_show_list():
    print "Loading TV show list..."
    if os.path.exists(os.path.expanduser("~/.subtd/list")):
        print "List found locally, loaded!"
        with open(os.path.expanduser("~/.subtd/list")) as listfile:
            return cPickle.load(listfile)
    print "Downloading Tv show list from the internet..."
    if not os.path.exists(os.path.expanduser("~/.subtd")):
        os.mkdir(os.path.expanduser("~/.subtd"))
    tv_shows = download_tv_show_list()
    print "Done!"
    with open(os.path.expanduser("~/.subtd/list"), 'w') as listfile:
        cPickle.dump(tv_shows, listfile)
    return tv_shows

if __name__ == '__main__':
    tvshows = get_tv_show_list()
    
