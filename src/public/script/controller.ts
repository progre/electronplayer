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
import Title from './title';
import Models from './models';
const IS_WIN = navigator.platform.indexOf('Win') > 0;

export function attach(
    element: HTMLElement,
    video: HTMLVideoElement,
    title: Title,
    models: Models
    ) {

    element.addEventListener('wheel', event => {
        // Windowsのデフォルトでは+-100 OSXだと+-1~
        let delta: number;
        if (IS_WIN) {
            delta = event.deltaY < 0 ? -0.05 : 0.05;
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
            if ((event.buttons & 0x01) > 0) {
                models.addPitch((event.clientY - prev.y) / 175);
                models.addYaw((event.clientX - prev.x) / 175);
            }
            if ((event.buttons & 0x02) > 0) {
                models.addZoom((event.clientY - prev.y) / 175);
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
}
