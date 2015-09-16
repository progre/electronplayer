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
export default class Title {
    private name = 'untitled';
    private volume = 1.0;

    constructor(private document: { title: string }) {
        this.update();
    }

    setName(name: string) {
        this.name = name;
        this.update();
    }

    setVolume(volume: number) {
        this.volume = volume;
        this.update();
    }

    private update() {
        this.document.title = `${this.name}  🔈 ${Math.round(this.volume * 100)}`;
    }
}
