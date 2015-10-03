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

export interface Model {
    positionBuffer: WebGLBuffer;
    texCoord1Buffer: WebGLBuffer;
    texCoord2Buffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    indexCount: number;
}

export function createModel(gl: WebGLRenderingContext) {
    let latitudeBands = 90;
    let longitudeBands = 16;
    let radius = 2;

    let vertexPositionData: number[] = [];
    let texCoord1Data: number[] = [];
    let texCoord2Data: number[] = [];
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        let theta = latNumber * Math.PI / latitudeBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longitudeBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;
            // ER
            // vertexPositionData.push(radius * x);
            // vertexPositionData.push(radius * y);
            // vertexPositionData.push(radius * z);

            // DF
            vertexPositionData.push(radius * -y);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * z);

            // plane
            // vertexPositionData.push(0);
            // vertexPositionData.push(latNumber / latitudeBands * -2 + 1);
            // vertexPositionData.push((longNumber / longitudeBands * -2 + 1) * 2);

            // pushEquirectangular(textureCoordData, longNumber, longitudeBands, latNumber, latitudeBands);
            pushDualFisheye(texCoord1Data, texCoord2Data, longNumber / longitudeBands, latNumber / latitudeBands);
        }
    }

    let indexData: number[] = [];
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            let first = (latNumber * (longitudeBands + 1)) + longNumber;
            let second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    return <Model>{
        positionBuffer: glcommon.createPositionBuffer(gl, new Float32Array(vertexPositionData)),
        texCoord1Buffer: glcommon.createTextureCoordBuffer(gl, new Float32Array(texCoord1Data)),
        texCoord2Buffer: texCoord2Data.length === 0 ? null : glcommon.createTextureCoordBuffer(gl, new Float32Array(texCoord2Data)),
        indexBuffer: glcommon.createIndexBuffer(gl, new Uint16Array(indexData)),
        indexCount: indexData.length
    };
}

function pushEquirectangular(textureCoordData: number[], longNumber: number, longitudeBands: number, latNumber: number, latitudeBands: number) {
    let u = (longNumber / longitudeBands);
    let v = 1 - (latNumber / latitudeBands);

    textureCoordData.push(u);
    textureCoordData.push(v);
}

function pushDualFisheye(texCoord1Data: number[], texCoord2Data: number[], longitude: number, latitude: number) {
    let radius = 0.5 - 0.2; // 縦1横2として
    let center = {
        y: 0.5,
        left: 0.25 - 0.025,
        right: 0.75 + 0.025
    };
    let rect = {
        left: {
            left: center.left - radius / 2,
        },
        right: {
            left: center.right - radius / 2,
        },
        bottom: center.y - radius
    };
    {
        let {u, v} = counterclockwiseCircle(longitude, latitude * radius * 2);
        texCoord1Data.push(u / 2 + rect.left.left);
        texCoord1Data.push(v + rect.bottom);
    }
    {
        let {u, v} = clockwiseCircle(longitude, (1 - latitude) * radius * 2);
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
