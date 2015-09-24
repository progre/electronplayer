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
import * as shader from './shader';
import {createModel, Model} from './model';
import Models from '../models';

export function main(canvas: HTMLCanvasElement, video: HTMLVideoElement, models: Models) {
    let gl = glcommon.getGLContext(canvas);
    let shaderProgram = shader.createShaderProgram(gl);
    let model = createModel(gl);
    let texture = createTexture(gl, video);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.clearColor(0.02, 0.04, 0.1, 1.0);
    gl.cullFace(gl.BACK);
    gl.viewport(0, 0, canvas.width, canvas.height);

    let pMatrix = mat4.create(); // perspective matrix (投影)
    mat4.perspective(pMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);
    let mvMatrix = mat4.create(); // model view matrix

    let renderer = function() {
        requestAnimationFrame(renderer);

        updateCamera(mvMatrix, models);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        updateTexture(gl, texture, video);
        shader.attach(
            gl,
            shaderProgram.locations,
            model.positionBuffer,
            model.textureCoordBuffer,
            texture,
            pMatrix,
            mvMatrix);
        draw(gl, model);
    };
    requestAnimationFrame(renderer);
}

function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement|HTMLVideoElement) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function updateTexture(
    gl: WebGLRenderingContext,
    texture: WebGLTexture,
    video: HTMLVideoElement
    ) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function updateCamera(mvMatrix: GLM.IArray, models: Models) {
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, models.zoom * 2.5 - 4.5]);
    mat4.rotateX(mvMatrix, mvMatrix, -models.pitch);
    mat4.rotateY(mvMatrix, mvMatrix, -models.yaw);
}

function draw(gl: WebGLRenderingContext, model: Model) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
}
