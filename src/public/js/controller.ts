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
import ViewParams from './gl/viewparams';
import Title from './title';
const IS_WIN = navigator.platform.indexOf('Win') >= 0;

export function attach(
    element: HTMLElement,
    sub: HTMLElement,
    video: HTMLVideoElement,
    title: Title,
    viewParams: ViewParams
    ) {
    element.addEventListener('wheel', event => {
        // Windowsのデフォルトでは+-100 OSXだと+-1~
        let delta: number;
        if (IS_WIN) {
            delta = event.deltaY > 0 ? -0.05 : 0.05;
        } else {
            delta = event.deltaY / 1000;
        }
        let volume = video.volume + delta;
        if (volume < 0) {
            volume = 0;
        } else if (1 < volume) {
            volume = 1;
        }
        video.volume = volume;
        title.setVolume(volume);
    });
    {
        let roll = false;
        let zoom = false;
        let prev: { x: number, y: number };
        element.addEventListener('mousedown', event => {
            switch (event.button) {
                case 1:
                    roll = true;
                    break;
                case 2:
                    zoom = true;
                    break;
                default:
                    break;
            }
            prev = toXY(event);
        });
        element.addEventListener('mousemove', event => {
            if ((event.buttons & (0x01 | 0x02)) === 0) {
                return;
            }
            let x = (event.clientX - prev.x) / element.clientHeight * 4;
            let y = (event.clientY - prev.y) / element.clientHeight * 4;
            if ((event.buttons & 0x01) > 0) {
                viewParams.addYaw(x);
                viewParams.addPitch(y);
            }
            if ((event.buttons & 0x02) > 0) {
                viewParams.addZoom(y);
            }
            prev = toXY(event);
        });
        element.addEventListener('mouseup', event => {
            switch (event.button) {
                case 1:
                    roll = false;
                    break;
                case 2:
                    zoom = false;
                    break;
                default:
                    break;
            }
        });

        function toXY(event: MouseEvent) {
            return {
                x: event.clientX,
                y: event.clientY
            };
        }
    }
    {
        let timer: any = null;
        sub.addEventListener('click', event => {
            if (timer != null) {
                return;
            }
            // 頭出し
            let prevTime = video.currentTime;
            video.playbackRate = 2.0;
            timer = setInterval(
                () => {
                    if (video.currentTime - prevTime < 0.5 * 1.1) { // TODO: seekingで代用できる気がする
                        clearInterval(timer);
                        timer = null;
                        sub.hidden = false;
                        video.playbackRate = 1.0;
                        return;
                    }
                    prevTime = video.currentTime;
                    sub.hidden = !sub.hidden;
                },
                500);
            sub.hidden = true;
        });
    }
}
