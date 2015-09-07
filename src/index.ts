/// <reference path="./typings.d.ts" />
'use strict';
require('source-map-support').install();
require('crash-reporter').start();
import {sep} from 'path';
import * as chokidar from 'chokidar';
import * as log4js from 'log4js';
let app = require('app');
let BrowserWindow = require('browser-window');

let mainWindow: any = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ width: 800, height: 600 });
    mainWindow.loadUrl('file://' + __dirname + '/public/index.html');
});
