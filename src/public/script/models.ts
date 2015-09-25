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
const HALF_PI = Math.PI / 2;
const DOUBLE_PI = Math.PI * 2;

export default class Models {
    public pitch = 0;
    public yaw = 0;
    public zoom = 1;

    addPitch(y: number) {
        this.pitch += y - (this.zoom * y * 0.225);
        if (this.pitch < -HALF_PI) {
            this.pitch = -HALF_PI;
        } else if (HALF_PI < this.pitch) {
            this.pitch = HALF_PI;
        }
    }

    addYaw(x: number) {
        this.yaw += x - (this.zoom * x * 0.225);
        if (this.yaw < 0) {
            this.yaw += DOUBLE_PI;
        } else if (DOUBLE_PI < this.yaw) {
            this.yaw -= DOUBLE_PI;
        }
    }

    addZoom(z: number) {
        this.zoom += z;
        if (this.zoom < 0) {
            this.zoom = 0;
        } else if (1 < this.zoom ) {
            this.zoom = 1;
        }
    }
}
