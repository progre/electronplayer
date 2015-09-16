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
import * as http from 'http';
import * as fs from 'fs';
let bluebird = require('bluebird');
let testTcp = require('test-tcp');
import {v4 as uuid} from 'node-uuid';
import Loader from './loader';
let emptyPort: () => Promise<number> = bluebird.promisify(testTcp.empty_port);

export default class MKVServer {
    constructor(private cachePath: string) {
    }

    listen() {
        return emptyPort()
            .then(port => new Promise<number>((resolve, reject) => {
                http.createServer((req, res) => this.requestListener(req, res))
                    .listen(port, () => resolve(port));
            }));
    }

    private requestListener(request: http.IncomingMessage, response: http.ServerResponse) {
        let url = this.parseUrl(request.url);
        if (url == null) {
            response.writeHead(404);
            response.end();
            return;
        }
        if (request.method !== 'GET') {
            response.writeHead(405);
            response.end();
            return;
        }
        response.setHeader('Content-Type', 'video/mkv');

        let loader = new Loader();
        request.on('close', () => {
            loader.kill();
        });
        let filePath = this.cachePath + '/' + uuid() + '.mkv';
        fetch(loader, url, filePath, buffer => {
            response.write(buffer);
        }).then(() => {
            response.end();
        }).catch(err => {
            if (!response.sendDate) {
                response.writeHead(500);
            }
            response.end();
        });
    }

    private parseUrl(url: string) {
        let m = /\/(.+).mkv/.exec(url);
        if (m == null) {
            return null;
        }
        return decodeURIComponent(m[1]);
    }
}

function fetch(loader: Loader, url: string, filePath: string, listener: (buffer: Buffer) => void) {
    loader.load(url, filePath)
        .catch(err => {
            console.error(err);
        });
    return openRetryable(filePath, 10)
        .then(fd => {
            let bufferSize = 1 * 1024 * 1024;
            let buffer = new Buffer(bufferSize);
            return readRecursive(fd, buffer, loader, listener)
                .then(() => bluebird.promisify(fs.close)(fd))
                .catch(() => bluebird.promisify(fs.close)(fd));
        });
}

function openRetryable(filePath: string, count: number) {
    return <Promise<number>>bluebird.promisify(fs.open)(filePath, 'r')
        .catch((err: Error) => {
            if (--count === 0) {
                return Promise.reject(err);
            }
            return bluebird.delay(1000)
                .then(() => openRetryable(filePath, count));
        });
}

function readRecursive(
    fd: number,
    buffer: Buffer,
    loader: Loader,
    listener: (buffer: Buffer) => void): Promise<void> {
    return bluebird.promisify(fs.read)(fd, buffer, 0, buffer.length, null)
        .then((obj: any[]) => {
            let bytesRead = obj[0];
            let buf = obj[1];
            if (bytesRead === 0) {
                if (!loader.running) {
                    return;
                }
                return bluebird.delay(1000)
                    .then(() => readRecursive(fd, buf, loader, listener));
            } else {
                listener(buf.slice(0, bytesRead));
            }
            return readRecursive(fd, buf, loader, listener);
        });
}
