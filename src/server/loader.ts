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
import * as stream from 'stream';
import * as FfmpegCommand from 'fluent-ffmpeg';

export default class Loader {
    private runningCommand: FfmpegCommand;

    static setFfmpegPath(ffmpegPath: string) {
        FfmpegCommand.setFfmpegPath(ffmpegPath);
    }

    get running() {
        return this.runningCommand != null;
    }

    load(url: string, writable: stream.Writable) {
        return new Promise((resolve, reject) => {
            console.log(url);
            this.runningCommand = FfmpegCommand(url)
                .audioCodec('copy')
                .videoCodec('copy')
                .format('matroska')
                .on('error', reject) // killした時もerrorになるらしい
                .on('end', resolve)
                .pipe(writable, {end:true});
        }).then(() => {
            this.runningCommand = null;
        }).catch(err => {
            this.runningCommand = null;
            return Promise.reject(err);
        });
    }

    kill() {
        if (this.runningCommand == null) {
            return;
        }
        this.runningCommand.kill();
        this.runningCommand = null;
    }
}
