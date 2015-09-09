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

export function main(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    let gl = glcommon.getGLContext(canvas);
    let shaderProgram = shader.createShaderProgram(gl);
    let model = createModel(gl);
    let texture = createTexture(gl, video);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    let mvMatrix = mat4.create();
    let pMatrix = mat4.create();

    let renderer = function() {
        drawScene(
            gl,
            canvas.width,
            canvas.height,
            shaderProgram.locations,
            video,
            texture,
            model,
            mvMatrix,
            pMatrix);
        requestAnimationFrame(renderer);
    };
    renderer();
}

let i = 3;
function drawScene(
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    shaderLocations: shader.Locations,
    video: HTMLVideoElement,
    moonTexture: WebGLTexture,
    model: Model,
    mvMatrix: GLM.IArray,
    pMatrix: GLM.IArray
    ) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // mat4.identity(pMatrix);
    mat4.perspective(pMatrix, 45, width / height, 0.1, 100.0);
    mat4.translate(pMatrix, pMatrix, [0, 0, -i]);
    // i += 0.01;
    // if (i > 10) {
    //     i = -2;
    // }
    // mat4.identity(mvMatrix);
    // mat4.translate(mvMatrix, mvMatrix, [0, 0, -6]);
    // たぶんここで行列計算するんじゃなくて、シェーダーに渡して極力GPUに計算させるものなのかね

    shader.attach(
        gl,
        shaderLocations,
        model.positionBuffer,
        model.textureCoordBuffer,
        moonTexture,
        pMatrix,
        mvMatrix);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
}

function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement|HTMLVideoElement) {
    let texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>image);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    // gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
