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
/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="../../../typings/DefinitelyTyped/gl-matrix/gl-matrix.d.ts" />
'use strict';
import {initScreen, main} from './gl/index';
import {getGLContext} from './gl/glcommon';
import {attach} from './controller';
import Title from './title';
import Models from './models';

class Main {
    private title = new Title(document);

    constructor() {
        let canvas = <HTMLCanvasElement>document.getElementById('canvas');
        let gl = getGLContext(canvas);
        let pMatrix = mat4.create(); // perspective matrix (投影)

        window.addEventListener('resize', ev => {
            expandCanvas(canvas);
            initScreen(gl, canvas, pMatrix);
        });
        expandCanvas(canvas);
        initScreen(gl, canvas, pMatrix);

        let opts = options();
        let models = new Models();
        let video = <HTMLVideoElement>document.createElement('video');
        attach(canvas, video, this.title, models);
        loadVideo(video, `http://127.0.0.1:${opts.get('port') }/${opts.get('url') }.mkv`)
            .then(() => {
                main(gl, canvas, video, pMatrix, models);
            });
    }
}

(<any>window).main = new Main();

function options() {
    let map = new Map<string, string>();
    location.search
        .split(/[?&]/)
        .map(x => x.split('='))
        .forEach(x => map.set(x[0], x[1]));
    return map;
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        let image = new Image();
        image.onload = function() {
            resolve(image);
        };
        image.src = src;
    });
}

function loadVideo(video: HTMLVideoElement, src: string) {
    return new Promise<void>((resolve, reject) => {
        (<any>window).video = video;
        video.addEventListener('play', function() {
            video.removeEventListener('play', this);
            resolve();
        });
        video.addEventListener('ended', () => {
            alert('ended');
        });
        video.addEventListener('error', (err) => {
            alert(err);
        });
        video.addEventListener('abord', (event: Event) => console.log('abord', event));
        // video.addEventListener('canplay', (event: Event) => console.log('canplay', event));
        // video.addEventListener('canplaythrough', (event: Event) => console.log('canplaythrough', event));
        // video.addEventListener('durationchange', (event: Event) => console.log('durationchange', event));
        video.addEventListener('emptied', (event: Event) => console.log('emptied', event));
        video.addEventListener('error', (event: Event) => console.log('error', event));
        video.addEventListener('emptied', (event: Event) => console.log('emptied', event));
        video.addEventListener('ended', (event: Event) => console.log('ended', event));
        // video.addEventListener('loadedmetadata', (event: Event) => console.log('loadedmetadata', event));
        // video.addEventListener('loadeddata', (event: Event) => console.log('loadeddata', event));
        // video.addEventListener('loadstart', (event: Event) => console.log('loadstart', event));
        video.addEventListener('pause', (event: Event) => console.log('pause', event));
        // video.addEventListener('play', (event: Event) => console.log('play', event));
        // video.addEventListener('playing', (event: Event) => console.log('playing', event));
        // video.addEventListener('progress', (event: Event) => console.log('progress', event)); // ネットワークからのデータ入力
        video.addEventListener('ratechange', (event: Event) => console.log('ratechange', event));
        video.addEventListener('seeked', (event: Event) => console.log('seeked', event));
        video.addEventListener('seeking', (event: Event) => console.log('seeking', event));
        // video.addEventListener('suspend', (event: Event) => console.log('suspend', event));
        // video.addEventListener('timeupdate', (event: Event) => console.log('timeupdate', event)); // 再生位置更新
        // video.addEventListener('volumechange', (event: Event) => console.log('volumechange', event));
        video.addEventListener('waiting', (event: Event) => console.log('waiting', event));

        video.addEventListener('stalled', (event: Event) => console.log('stalled', event));
        video.autoplay = true;
        src = 'mp4_h264_aac.mp4';
        video.loop = true;
        video.src = src;
    });
}

function expandCanvas(canvas: HTMLCanvasElement) {
    let doc = document.documentElement;
    canvas.width = doc.clientWidth;
    canvas.height = doc.clientHeight;
}
