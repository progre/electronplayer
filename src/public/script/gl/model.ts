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

const LATITUDE_BANDS = 90;
const LONGITUDE_BANDS = 160;

export interface Model {
    positionBuffer: WebGLBuffer;
    texCoord1Buffer: WebGLBuffer;
    texCoord2Buffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    indexCount: number;
    use2ndTexCoord: boolean;
}

export interface ModelParams {
    type: string;
    dualFisheye: {
        size: number;
        y: number;
        left: number;
        right: number;
    }
}

export function createModel(gl: WebGLRenderingContext, params: ModelParams) {
    let indexData: number[] = [];
    for (let latNumber = 0; latNumber < LATITUDE_BANDS; latNumber++) {
        for (let longNumber = 0; longNumber < LONGITUDE_BANDS; longNumber++) {
            let first = (latNumber * (LONGITUDE_BANDS + 1)) + longNumber;
            let second = first + LONGITUDE_BANDS + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    let m = <Model>{
        positionBuffer: gl.createBuffer(),
        texCoord1Buffer: gl.createBuffer(),
        texCoord2Buffer: gl.createBuffer(),
        indexBuffer: glcommon.createIndexBuffer(gl, new Uint16Array(indexData)),
        indexCount: indexData.length
    };
    updateModel(gl, m, params);
    return m;
}

export function updateModel(gl: WebGLRenderingContext, model: Model, params: ModelParams) {
    let radius = 2;
    let texCoord1Array: number[] = [];
    let texCoord2Array: number[] = [];

    let positionArray: number[] = [];
    for (let latNumber = 0; latNumber <= LATITUDE_BANDS; latNumber++) {
        let theta = latNumber * Math.PI / LATITUDE_BANDS;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= LONGITUDE_BANDS; longNumber++) {
            let phi = longNumber * 2 * Math.PI / LONGITUDE_BANDS;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;
            switch (params.type) {
                case 'equirectangular':
                    positionArray.push(radius * x);
                    positionArray.push(radius * y);
                    positionArray.push(radius * z);
                    // plane
                    // positionArray.push(0);
                    // positionArray.push(latNumber / latitudeBands * -2 + 1);
                    // positionArray.push((longNumber / longitudeBands * -2 + 1) * 2);
                    pushEquirectangular(texCoord1Array, texCoord2Array, longNumber, LONGITUDE_BANDS, latNumber, LATITUDE_BANDS);
                    break;
                case 'dualFisheye':
                    positionArray.push(radius * -y);
                    positionArray.push(radius * x);
                    positionArray.push(radius * z);
                    pushDualFisheye(texCoord1Array, texCoord2Array, params, longNumber / LONGITUDE_BANDS, latNumber / LATITUDE_BANDS);
                    break;
                default:
                    throw new Error();
            }
        }
    }
    glcommon.updateVertexBuffer(gl, model.positionBuffer, new Float32Array(positionArray));
    glcommon.updateVertexBuffer(gl, model.texCoord1Buffer, new Float32Array(texCoord1Array));
    glcommon.updateVertexBuffer(gl, model.texCoord2Buffer, new Float32Array(texCoord2Array));
    model.use2ndTexCoord = params.type === 'dualFisheye';
}

export function createModelParams() {
    return <ModelParams>{
        type: 'dualFisheye',
        dualFisheye: {
            size: 0.4503,
            y:  0.4536,
            left: 0.226,
            right: 0.7219
        }
    };
}

function pushEquirectangular(texCoord1Data: number[], texCoord2Data: number[], longNumber: number, longitudeBands: number, latNumber: number, latitudeBands: number) {
    let u = (longNumber / longitudeBands);
    let v = 1 - (latNumber / latitudeBands);

    texCoord1Data.push(u);
    texCoord1Data.push(v);
    texCoord2Data.push(u);
    texCoord2Data.push(v);
}

function pushDualFisheye(texCoord1Data: number[], texCoord2Data: number[], params: ModelParams, longitude: number, latitude: number) {
    let rect = {
        left: {
            left: params.dualFisheye.left - params.dualFisheye.size / 2,
        },
        right: {
            left: params.dualFisheye.right - params.dualFisheye.size / 2,
        },
        bottom: params.dualFisheye.y - params.dualFisheye.size
    };
    {
        let {u, v} = counterclockwiseCircle(longitude, latitude * params.dualFisheye.size * 2);
        texCoord1Data.push(u / 2 + rect.left.left);
        texCoord1Data.push(v + rect.bottom);
    }
    {
        let {u, v} = clockwiseCircle(longitude, (1 - latitude) * params.dualFisheye.size * 2);
        texCoord2Data.push(u / 2 + rect.right.left);
        texCoord2Data.push(v + rect.bottom);
    }
}

/**
 * OpenGL座標系において時計回りの円を描く
 * [0, 1], [0, 0], [1, 1], [1, 0]の範囲で描く
 * angleは0.0~1.0
 */
function clockwiseCircle(angle: number, radius: number) {
    return {
        u: (Math.sin(angle * 2 * Math.PI + Math.PI / 2) * radius * 2 + 1) / 2,
        v: (Math.cos(angle * 2 * Math.PI + Math.PI / 2) * radius * 2 + 1) / 2
    };
}

function counterclockwiseCircle(angle: number, radius: number) {
    return {
        u: (Math.cos(angle * 2 * Math.PI + Math.PI) * radius * 2 + 1) / 2,
        v: (Math.sin(angle * 2 * Math.PI + Math.PI) * radius * 2 + 1) / 2
    };
}
