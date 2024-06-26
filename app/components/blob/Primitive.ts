import * as THREE from 'three';
import {Object3D } from "three";

export class Primitive extends THREE.Group {
    private mesh: Object3D;
    public point: THREE.Points;
    public mat: THREE.ShaderMaterial;
    private start: number;

    constructor() {
        super();
        this.start = Date.now();
        this.mesh = new THREE.Object3D();
        this.mat = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                time: {
                    type: "f",
                    value: 0.1
                },
                pointscale: {
                    type: "f",
                    value: 0.2
                },
                decay: {
                    type: "f",
                    value: 0.3
                },
                size: {
                    type: "f",
                    value: 1
                },
                displace: {
                    type: "f",
                    value: 0.3
                },
                complex: {
                    type: "f",
                    value: 0.0
                },
                waves: {
                    type: "f",
                    value: 0.10
                },
                eqcolor: {
                    type: "f",
                    value: 0.0
                },
                rcolor: {
                    type: "f",
                    value: 0.0
                },
                gcolor: {
                    type: "f",
                    value: 0.0
                },
                bcolor: {
                    type: "f",
                    value: 0.0
                },
                fragment: {
                    type: "i",
                    value: true
                },
                redhell: {
                    type: "i",
                    value: true
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        const wir_mat = new THREE.MeshBasicMaterial({color: 0x000000});
        const geo = new THREE.IcosahedronGeometry(2, 6);
        const wir = new THREE.IcosahedronGeometry(2.3, 2);
        this.point = new THREE.Points(wir, this.mat);
        this.add(new THREE.Mesh(geo, this.mat));
        this.add(this.point);
    }

    resetMat(options) {
        this.point.visible = options.perlin.points;
        //---
        this.mat.uniforms['time'].value = (options.perlin.speed / 1000) * (Date.now() - this.start);

        this.mat.uniforms['pointscale'].value =    options.perlin.perlins;
        this.mat.uniforms['decay'].value =         options.perlin.decay;
        // this.mat.uniforms['size'].value =          options.perlin.size;
        this.mat.uniforms['displace'].value =      options.perlin.displace;
        this.mat.uniforms['complex'].value =       options.perlin.complex;
        this.mat.uniforms['waves'].value =         options.perlin.waves;
        this.mat.uniforms['fragment'].value =      options.perlin.fragment;

        this.mat.uniforms['redhell'].value =       options.perlin.redhell;
        this.mat.uniforms['eqcolor'].value =       options.perlin.eqcolor;
        this.mat.uniforms['rcolor'].value =        options.perlin.rcolor;
        this.mat.uniforms['gcolor'].value =        options.perlin.gcolor;
        this.mat.uniforms['bcolor'].value =        options.perlin.bcolor;
    }
}

const vertexShader = `
//
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Many thanks to Ian McEwan of Ashima Arts for the
  // ideas for permutation and gradient selection.
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/ashima/webgl-noise
  //

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }
  
  // Classic Perlin noise
  float cnoise(vec3 P)
  {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 5.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 5.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 5.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 5.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }

  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 5.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 5.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 5.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 5.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 1.5 * n_xyz;
  }
  
  // Turbulence By Jaume Sanchez => https://codepen.io/spite/
  
  varying vec2 vUv;
  varying float noise;
  varying float qnoise;
  varying float displacement;
  
  uniform float time;
  uniform float displace;
  uniform float pointscale;
  uniform float decay;
  uniform float size;
  uniform float complex;
  uniform float waves;
  uniform float eqcolor;
  uniform bool fragment;

  float turbulence( vec3 p) {
    float t = - 0.005;
    for (float f = 1.0 ; f <= 1.0 ; f++ ){
      float power = pow( 1.3, f );
      t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
    }
    return t;
  }

  void main() {

    vUv = uv;

    noise = (2.0 *  - waves) * turbulence( decay * abs(normal + time));
    qnoise = (0.3 *  - eqcolor) * turbulence( decay * abs(normal + time));
    float b = pnoise( complex * (position) + vec3( (decay * 2.0) * time ), vec3( 100.0 ) );
    
    displacement = - atan(noise) + tan(b * displace);

    vec3 newPosition = (position) + (normal * displacement);
    gl_Position = (projectionMatrix * modelViewMatrix) * vec4( newPosition, abs(size) );
    gl_PointSize = (3.0);
  }
`;

const fragmentShader = `
varying float qnoise;
  varying float noise;
  
  uniform float time;
  uniform bool redhell;
  uniform float rcolor;
  uniform float gcolor;
  uniform float bcolor;

  void main() {
    float r, g, b;
    
    if (!redhell == true) {
      r = sin(qnoise + rcolor);
      g = normalize(qnoise + (gcolor / 2.0));
      b = tan(qnoise + bcolor);
    } else {
      r = normalize(qnoise + rcolor);
      g = cos(qnoise + gcolor);
      b = sin(qnoise + bcolor);
    }
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;
