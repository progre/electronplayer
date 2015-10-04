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
import Main from './main';

let params: any;
$('ready', () => {
    window.opener.postMessage(JSON.stringify({ method: 'modelParams' }), '*');
    window.addEventListener('message', event => {
        let data = JSON.parse(event.data);
        console.log(data.method === 'modelParms');
        switch (data.method) {
            case 'modelParams':
                params = data.arg;
                $('#size').val((params.dualFisheye.size * 2).toString());
                $('#y').val(params.dualFisheye.y.toString());
                $('#left').val((params.dualFisheye.left * 2).toString());
                $('#right').val(((params.dualFisheye.right - 0.5) * 2).toString());
                $('#size')
                    .change(function() {
                        params.dualFisheye.size = $(this).val() / 2;
                        print(params.dualFisheye);
                        window.opener.postMessage(JSON.stringify({ method: 'updateModelParams', arg: params }), '*');
                    });
                $('#y')
                    .change(function() {
                        params.dualFisheye.y = $(this).val();
                        print(params.dualFisheye);
                        window.opener.postMessage(JSON.stringify({ method: 'updateModelParams', arg: params }), '*');
                    });
                $('#left')
                    .change(function() {
                        params.dualFisheye.left = $(this).val() / 2;
                        print(params.dualFisheye);
                        window.opener.postMessage(JSON.stringify({ method: 'updateModelParams', arg: params }), '*');
                    });
                $('#right')
                    .change(function() {
                        params.dualFisheye.right = $(this).val() / 2 + 0.5;
                        print(params.dualFisheye);
                        window.opener.postMessage(JSON.stringify({ method: 'updateModelParams', arg: params }), '*');
                    });
                break;
            default:
                throw new Error(data.method);
        }
    });
});

function print(params: any) {
    console.log(params.size + ', ' + params.y + ', ' + params.left + ', ' + params.right);
}
