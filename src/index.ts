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
import * as log4js from 'log4js';
const promisify: (func: Function) => (...args: any[]) => Promise<any> = require('bluebird').promisify;
import * as app from 'app';
import * as BrowserWindow from 'browser-window';
import Loader from './server/loader';
import MKVServer from './server/mkvserver';
import {createAppMenu} from './server/appmenu';

const logger = log4js.getLogger();

let cacheDir = app.getPath('userData') + '/StreamCache';
let mainWindow: GitHubElectron.BrowserWindow = null;
let url = argv()[0];

initFfmpeg();
Promise.all(
    [
        initCacheDir(cacheDir)
            .then(() => new MKVServer(cacheDir).listen()),
        new Promise((resolve, reject) => app.on('ready', resolve))
    ])
    .then(results => {
        let port = results[0];
        mainWindow = new BrowserWindow({ width: 800, height: 600 });
        mainWindow.setMenu(createAppMenu(mainWindow.webContents));
        mainWindow.loadUrl(
            `file://${__dirname}/public/index.html?port=${port}&url=${encodeURIComponent(url) }`);
    })
    .catch((err: any) => {
        logger.fatal(err.stack);
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
