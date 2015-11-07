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
/// <reference path="typings.d.ts" />
'use strict';
declare const require: any;
const _require = require;
const ipc: GitHubElectron.InProcess = _require('ipc');
import GLRenderer from './gl/index';
import ViewParams from './gl/viewparams';
import * as controller from './controller';
import Title from './title';

export default class Main {
    private title = new Title(document);
    private glRenderer: GLRenderer;
    private dualFisheyeAdjustment: GitHubElectron.BrowserWindowProxy;

    constructor() {
        ipc.on('openDualFisheyeAdjustment', () => this.openDualFisheyeAdjustment());
        ipc.on('setSourceType', (type: string) => this.setSourceType(type));
        window.addEventListener('message', event => {
            let data = JSON.parse(event.data);
            switch (data.method) {
                case 'modelParams':
                    this.sendResult(data.id, this.glRenderer.modelParams);
                    break;
                case 'updateModelParams':
                    this.glRenderer.updateModelParams(data.arg);
                    break;
                default:
                    throw new Error(data.method);
            }
        });

        let canvas = <HTMLCanvasElement>document.getElementById('canvas');
        expandCanvas(canvas);
        this.glRenderer = new GLRenderer(canvas);

        window.addEventListener('resize', ev => {
            expandCanvas(canvas);
            this.glRenderer.updateScreen();
        });

        let opts = options();
        let models = new ViewParams();
        let video = <HTMLVideoElement>document.createElement('video');
        let sub = <HTMLElement>document.getElementById('sub');
        controller.attach(canvas, sub, video, this.title, models);
        loadVideo(video, `http://127.0.0.1:${opts.get('port') }/${opts.get('url') }.mkv`)
            .then(() => {
                this.glRenderer.start(video, models);
            });
    }

    private openDualFisheyeAdjustment() {
        let adjustment = this.dualFisheyeAdjustment;
        if (adjustment == null || adjustment.closed) {
            this.dualFisheyeAdjustment = window.open(
                'dfadjust.html',
                'dualFisheyeAdjustment',
                'width=460, height=360');
        } else {
            adjustment.focus();
        }
    }

    private setSourceType(type: string) {
        let params = this.glRenderer.modelParams;
        params.type = type;
        this.glRenderer.updateModelParams(params);
    }

    private sendResult(id: number, result: any) {
        this.dualFisheyeAdjustment.postMessage(JSON.stringify({ id, result }), '*');
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

function loadVideo(video: HTMLVideoElement, src: string) {
    return new Promise<void>((resolve, reject) => {
        (<any>window).video = video;
        video.addEventListener('play', function() {
            video.removeEventListener('play', this);
            resolve();
        });
        video.addEventListener('ended', () => {
            console.log('ended');
        });
        video.addEventListener('error', (err) => {
            console.error(err);
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
        video.src = src;
    });
}

function expandCanvas(canvas: HTMLCanvasElement) {
    let doc = document.documentElement;
    canvas.width = doc.clientWidth;
    canvas.height = doc.clientHeight;
}
