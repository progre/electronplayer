// Sphere Live Stream Player
// Copyright (C) 2015 progre (djyayutto@gmail.com)

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
/// <reference path="./typings.d.ts" />
'use strict';
require('source-map-support').install();
require('crash-reporter').start();
import * as fs from 'fs';
import Loader from './server/loader';
import MKVServer from './server/mkvserver';
let app = require('app');
let BrowserWindow = require('browser-window');

Loader.setFfmpegPath(__dirname + '/ffmpeg/ffmpeg.exe');

let cacheDir = app.getPath('userData') + '/StreamCache';
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}
let files = fs.readdirSync(cacheDir);
files.forEach(file => {
    fs.unlinkSync(cacheDir + '/' + file);
});

let mainWindow: any = null;
let server = new MKVServer(cacheDir);
let url = 'http://169.254.141.181:7144/stream/da198b4e8802b0bb7121b3ab63756093.flv'; // TODO: 引数から取る
// TODO: プリフェッチしてもいいかも

Promise.all([
    server.listen(),
    new Promise((resolve, reject) => app.on('ready', resolve))
]).then(results => {
    let port = results[0];
    mainWindow = new BrowserWindow({ width: 800, height: 600 });
    mainWindow.loadUrl(`file://${__dirname}/public/index.html?port=${port}&url=${encodeURIComponent(url) }`);
});

console.log(process.argv);
