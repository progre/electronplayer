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
import * as glcommon from './glcommon';
import * as model from './model';

let vertexShaderSource = `
    attribute vec3 position;
    attribute vec2 texCoord1;
    attribute vec2 texCoord2;

    uniform mat4 mvMatrix;
    uniform mat4 pMatrix;

    varying vec2 v_texCoord1;
    varying vec2 v_texCoord2;
    varying float v_x;

    void main(void) {
        gl_Position = pMatrix * mvMatrix * vec4(position, 1.0);
        v_texCoord1 = texCoord2;
        v_texCoord1 = texCoord1;
        v_texCoord2 = texCoord2;
        v_x = position.x;
    }
`;

let fragmentShaderSource = `
    precision mediump float;

    varying vec2 v_texCoord1;
    varying vec2 v_texCoord2;
    varying float v_x;

    uniform sampler2D sampler;
    uniform bool use2ndTexCoord;

    void main(void) {
        if (!use2ndTexCoord) {
            gl_FragColor = texture2D(sampler, vec2(v_texCoord1.s, v_texCoord1.t));
        } else {
            vec4 color1 = texture2D(sampler, vec2(v_texCoord1.s, v_texCoord1.t));
            vec4 color2 = texture2D(sampler, vec2(v_texCoord2.s, v_texCoord2.t));

            if (v_x < 0.0) {
                gl_FragColor = color1;
            } else {
                gl_FragColor = color2;
            }
        }
    }
`;

export interface Locations {
    position: number;
    texCoord1: number;
    texCoord2: number;
    pMatrix: WebGLUniformLocation;
    mvMatrix: WebGLUniformLocation;
    sampler: WebGLUniformLocation;
    use2ndTexCoord: WebGLUniformLocation;
}

export function createShaderProgram(gl: WebGLRenderingContext) {
    let program = glcommon.createProgram(gl, fragmentShaderSource, vertexShaderSource);
    let locations = <Locations>{};
    gl.useProgram(program);
    locations.position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(locations.position);

    locations.texCoord1 = gl.getAttribLocation(program, 'texCoord1');
    gl.enableVertexAttribArray(locations.texCoord1);

    locations.texCoord2 = gl.getAttribLocation(program, 'texCoord2');
    if (locations.texCoord2 < 0) throw new Error();
    gl.enableVertexAttribArray(locations.texCoord2);

    locations.pMatrix = gl.getUniformLocation(program, 'pMatrix');
    locations.mvMatrix = gl.getUniformLocation(program, 'mvMatrix');
    locations.sampler = gl.getUniformLocation(program, 'sampler');
    locations.use2ndTexCoord = gl.getUniformLocation(program, 'use2ndTexCoord');
    return { program, locations };
}

export function attach(
    gl: WebGLRenderingContext,
    locations: Locations,
    model: model.Model,
    texture: WebGLTexture,
    pMatrix: GLM.IArray,
    mvMatrix: GLM.IArray
    ) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.texCoord1Buffer);
    gl.vertexAttribPointer(locations.texCoord1, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.texCoord2Buffer);
    gl.vertexAttribPointer(locations.texCoord2, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(locations.sampler, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniformMatrix4fv(locations.pMatrix, false, pMatrix);
    gl.uniformMatrix4fv(locations.mvMatrix, false, mvMatrix);

    gl.uniform1i(locations.use2ndTexCoord, model.use2ndTexCoord ? 1 : 0);
}
