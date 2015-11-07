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
try { require('source-map-support').install(); } catch (e) { /* empty */ }
require('crash-reporter').start();
import * as fs from 'fs';
import * as log4js from 'log4js';
const promisify: (func: Function) => (...args: any[]) => Promise<any> = require('bluebird').promisify;
const logger = log4js.getLogger();
import * as app from 'app';
import * as BrowserWindow from 'browser-window';
import Loader from './server/loader';
import MKVServer from './server/mkvserver';
import {createAppMenu} from './server/appmenu';
log4js.configure({
    appenders: [{
        type: 'console',
        layout: { type: 'basic' }
    }]
});

Promise.resolve()
    .then(() => {
        let cacheDir = app.getPath('userData') + '/StreamCache';
        initFfmpeg();
        return Promise.all<any>([
            initCacheDir(cacheDir)
                .then(() => new MKVServer(cacheDir).listen()),
            getUrl(argv()[0]),
            new Promise((resolve, reject) => app.on('ready', resolve))
        ]);
    })
    .then(results => {
        let port = results[0];
        let url = results[1];
        logger.info(url);
        let mainWindow = new BrowserWindow({ width: 800, height: 600 });
        mainWindow.setMenu(createAppMenu(mainWindow.webContents));
        mainWindow.loadUrl(
            `file://${__dirname}/public/index.html?port=${port}&url=${encodeURIComponent(url) }`);
    })
    .catch((e) => {
        logger.fatal(e);
        app.quit();
    });

function initFfmpeg() {
    switch (process.platform) {
        case 'win32':
            Loader.setFfmpegPath(__dirname + '/ffmpeg/ffmpeg.exe');
            break;
        case 'darwin':
            Loader.setFfmpegPath(__dirname + '/ffmpeg/ffmpeg.osx');
            break;
        default:
            break;
    }
}

function initCacheDir(cacheDir: string) {
    return new Promise((resolve, reject) => fs.exists(cacheDir, resolve))
        .then((exists: boolean) => {
            if (!exists) {
                return promisify(fs.mkdir)(cacheDir);
            }
        })
        .then(() => promisify(fs.readdir)(cacheDir))
        .then((files: string[]) => {
            let unlink = promisify(fs.unlink);
            return Promise.all(files.map(file => unlink(cacheDir + '/' + file)));
        });
}

function argv() {
    let originalArgv = process.argv;
    if (originalArgv[0].endsWith('electron.exe') || originalArgv[0].endsWith('Electron')) {
        return originalArgv.splice(2);
    }
    return originalArgv.splice(1);
}

function getUrl(arg: string) {
    if (arg.indexOf('http') === 0) {
        return Promise.resolve(arg.replace('/pls/', '/stream/'));
    }
    return promisify(fs.readFile)(arg, 'ascii')
        .then(data => data.split('\r')[0]);
}
