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

let vertexShaderSource = `
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    varying vec2 vTextureCoord;

    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;
    }
`;

let fragmentShaderSource = `
    precision mediump float;

    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        gl_FragColor = vec4(textureColor.rgb, textureColor.a);
    }
`;

export interface Locations {
    vertexPosition: number;
    textureCoord: number;
    pMatrix: WebGLUniformLocation;
    mvMatrix: WebGLUniformLocation;
    sampler: WebGLUniformLocation;
}

export function createShaderProgram(gl: WebGLRenderingContext) {
    let program = glcommon.createProgram(gl, fragmentShaderSource, vertexShaderSource);
    let locations = <Locations>{};
    gl.useProgram(program);
    locations.vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(locations.vertexPosition);

    locations.textureCoord = gl.getAttribLocation(program, 'aTextureCoord');
    gl.enableVertexAttribArray(locations.textureCoord);

    locations.pMatrix = gl.getUniformLocation(program, 'uPMatrix');
    locations.mvMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    locations.sampler = gl.getUniformLocation(program, 'uSampler');
    return { program, locations };
}

export function attach(
    gl: WebGLRenderingContext,
    locations: Locations,
    positionBuffer: WebGLBuffer,
    textureCoordBuffer: WebGLBuffer,
    texture: WebGLTexture,
    pMatrix: GLM.IArray,
    mvMatrix: GLM.IArray
    ) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(locations.vertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(locations.textureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(locations.sampler, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniformMatrix4fv(locations.pMatrix, false, pMatrix);
    gl.uniformMatrix4fv(locations.mvMatrix, false, mvMatrix);
}
