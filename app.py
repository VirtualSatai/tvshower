import sys

from flask import Flask, render_template, json, request
import logging as l
import os
from datetime import datetime
from stat import *

URL_BASE = "https://satai.dk"

app = Flask(__name__)

items = [{"url": ("%s" % URL_BASE), "name": "Loading ...", "date": "...", "size": "..."}]
source = '/mnt/Series/'


def walk_tree(top, callback, file_list, to_visit, override=False):
    for f in os.listdir(top):
        pathname = os.path.join(top, f)
        try:
            mode = os.stat(pathname).st_mode
        except FileNotFoundError as e:
            l.error("Deleting file '{0}', because of error '{1}'".format(pathname, e))
            os.unlink(pathname)
            continue
        if S_ISDIR(mode):
            # It's a directory, recurse into it
            if f in to_visit or override:
                walk_tree(pathname, callback, file_list, to_visit, override=True)
            else:
                print("Not traversing into " + f, file=sys.stdout)
        elif S_ISREG(mode):
            # It's a file, call the callback function
            callback(pathname, file_list)
        else:
            l.error('Skipping {}'.format(pathname))


@app.route('/get_shows', methods=['POST'])
def get_folders():
    return json.dumps(sorted(os.listdir(source)))


def record_file_stats(file, file_list):
    if file.endswith(".mkv") or file.endswith(".avi") or file.endswith(".mp4"):
        file_list[file] = (os.stat(file).st_mtime, os.stat(file).st_size,)


@app.route('/')
def shows():
    return render_template('shows.html', items=items, edit_url="/edit")


@app.route('/edit')
def edit():
    return render_template('edit.html')


def formatSize(size):
    prefixes = {
        0: "",
        1: "k",
        2: "M",
        3: "G"
    }
    cnt = 0
    while size > 9000:
        size /= 1024
        cnt += 1

    return f"{int(size)}{prefixes[cnt]}"


@app.route('/get_content', methods=['POST'])
def get_content():
    content = request.json
    to_visit = content["shows"]
    all_files = dict()
    walk_tree(source, record_file_stats, all_files, to_visit)
    print(all_files.items())
    res = []
    for k, v in list(all_files.items()):
        ts, size = v
        res.append({
            "url": URL_BASE + "/tv/Series/" + "/".join(k.split("/")[3:]),
            "name": k.split("/")[-1],
            "date": datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d"),
            "size": formatSize(size)
        })
    newest = sorted(res, key=lambda x: x["date"], reverse=True)
    return json.dumps(newest[0:30])


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True, host='0.0.0.0')
