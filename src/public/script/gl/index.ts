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
import {getGLContext} from './glcommon';
import * as shader from './shader';
import Model from './model';
import ViewParams from './viewparams';
import ModelParams from './modelparams';

export default class GLRenderer {
    private pMatrix = mat4.create(); // perspective matrix (投影)
    modelParams = ModelParams.getDefault();
    private ratioOfHeight = 1;
    private gl: WebGLRenderingContext;
    private m: Model;

    constructor(private canvas: HTMLCanvasElement) {
        this.gl = getGLContext(canvas);
        this.m = new Model(this.gl);
        this.updateScreen();
    }

    start(video: HTMLVideoElement, models: ViewParams) {
        let shaderProgram = shader.createShaderProgram(this.gl);
        let texture = createTexture(this.gl, video);
        this.ratioOfHeight = video.videoWidth / 2 / video.videoHeight;
        this.m.updateParams(this.modelParams, this.ratioOfHeight);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.gl.clearColor(0.02, 0.04, 0.1, 1.0);
        this.gl.cullFace(this.gl.BACK);

        let mvMatrix = mat4.create(); // model view matrix

        let renderer = () => {
            requestAnimationFrame(renderer);

            updateCamera(mvMatrix, models, this.modelParams.direction);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.gl.enable(this.gl.CULL_FACE);
            updateTexture(this.gl, texture, video);
            shader.attach(
                this.gl,
                shaderProgram.locations,
                this.m,
                texture,
                this.pMatrix,
                mvMatrix);
            draw(this.gl, this.m);
        };
        requestAnimationFrame(renderer);
    }

    updateScreen() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        mat4.perspective(this.pMatrix, 45, this.canvas.width / this.canvas.height, 0.1, 100.0);
    }

    updateModelParams(params: ModelParams) {
        this.modelParams = params;
        this.m.updateParams(params, this.ratioOfHeight);
    }
}

function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement | HTMLVideoElement) {
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
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function updateCamera(mvMatrix: GLM.IArray, models: ViewParams, direction: string) {
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, models.zoom * 2.5 - 4.5]);
    switch (direction) {
        case 'left':
            mat4.rotateX(mvMatrix, mvMatrix, Math.PI * 3 / 2 - models.pitch);
            mat4.rotateZ(mvMatrix, mvMatrix, -models.yaw);
            break;
        case 'up':
            mat4.rotateX(mvMatrix, mvMatrix, -models.pitch);
            mat4.rotateY(mvMatrix, mvMatrix, -models.yaw);
            break;
        case 'right':
            mat4.rotateX(mvMatrix, mvMatrix, Math.PI / 2 - models.pitch);
            mat4.rotateZ(mvMatrix, mvMatrix, models.yaw);
            break;
        default:
            throw new Error('Unsupported direction: ' + direction);
    }
}

function draw(gl: WebGLRenderingContext, model: Model) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
}
