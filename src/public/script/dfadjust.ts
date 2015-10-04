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
$('ready', () => {
    modelParams().then(params => {
        $('#size')
            .val(<any>(params.dualFisheye.size))
            .change(function() {
                params.dualFisheye.size = $(this).val();
                updateModelParams(params);
            });
        $('#y')
            .val(<any>(params.dualFisheye.y))
            .change(function() {
                params.dualFisheye.y = $(this).val();
                updateModelParams(params);
            });

        $('#left')
            .val(<any>(params.dualFisheye.left))
            .change(function() {
                params.dualFisheye.left = $(this).val();
                updateModelParams(params);
            });
        $('#right')
            .val(<any>(params.dualFisheye.right))
            .change(function() {
                params.dualFisheye.right = $(this).val();
                updateModelParams(params);
            });
    });
});

function modelParams() {
    return call('modelParams');
}

function updateModelParams(params: any) {
    console.log(params.dualFisheye.size + ', ' + params.dualFisheye.y + ', ' + params.dualFisheye.left + ', ' + params.dualFisheye.right);
    window.opener.postMessage(JSON.stringify({ method: 'updateModelParams', arg: params }), '*');
}

function call(method: string, arg?: any) {
    return new Promise<any>((resolve, reject) => {
        let id = Math.floor(Math.random() * 10000000000000000);
        let listener = (event: MessageEvent) => {
            let obj = JSON.parse(event.data);
            if (obj.id !== id) {
                return;
            }
            window.removeEventListener('message', listener);
            resolve(obj.result);
        };
        window.addEventListener('message', listener);
        window.opener.postMessage(JSON.stringify({ id, method, arg }), '*');
    });
}
