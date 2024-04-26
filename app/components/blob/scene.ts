import * as THREE from 'three';
import { TweenMax } from 'gsap';
import {Primitive} from "./Primitive";

export const init = (width: number, height: number) => {
    const {renderer, scene, camera} = createWorld(width, height);
    // createGUI();
    const primitive = new Primitive();
    scene.add(primitive);
    animation( { renderer, scene, camera }, primitive);
    return {renderer}
}

const Theme = {
    primary: 0xFFFFFF,
    secundary: 0x292733,
    danger: 0xFF0000,
    darker: 0x000000
};



//------------------------------------------------------------------
const createWorld = (width: number, height: number) => {
    //---
    const scene = new THREE.Scene();
    //---
    const camera = new THREE.PerspectiveCamera(35, width/height, 1, 1000);
    camera.position.set(0, 0, 16);
    //---
    const renderer = new THREE.WebGLRenderer({antialias:false, alpha:true, preserveDrawingBuffer: true});
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // 设置清除颜色
    renderer.shadowMap.enabled = true;
    //---
    document.body.appendChild(renderer.domElement);
    // const onWindowResize() {
    //     _width = window.innerWidth;
    //     _height = window.innerHeight;
    //     renderer.setSize(_width, _height);
    //     camera.aspect = _width / _height;
    //     camera.updateProjectionMatrix();
    //     console.log('- resize -');
    // }
    // //---
    // window.addEventListener('resize', onWindowResize, false);

    return {
        scene, camera, renderer
    }
}

const options = {
    perlin: {
        speed: 0.4,
        size: 0.9,
        perlins: 1.0,
        decay: 1.20,
        displace: 1.00,
        complex: 0.50,
        waves: 3.7,
        eqcolor: 10.0,
        rcolor: 1.5,
        gcolor: 1.5,
        bcolor: 1.5,
        fragment: true,
        points: false,
        redhell: true
    },
    perlinRandom: function() {
        TweenMax.to(this.perlin, 2, {
            //decay: Math.random() * 1.0,
            waves: Math.random() * 20.0,
            complex: Math.random() * 1.0,
            displace: Math.random() * 2.5,
            ease:Elastic.easeOut
        });
    },
    random: function() {
        //this.perlin.redhell = Math.random() >= 0.5; // 10 1 0.1 1.2
        TweenMax.to(this.perlin, 1, {
            eqcolor: 11.0,
            rcolor: Math.random() * 1.5,
            gcolor: Math.random() * 0.5,
            bcolor: Math.random() * 1.5,
            ease:Quart.easeInOut
        });
    },
    normal: function() {
        this.perlin.redhell = true; // 10 1 0.1 1.2
        TweenMax.to(this.perlin, 1, {
            //speed: 0.12,
            eqcolor: 10.0,
            rcolor: 1.5,
            gcolor: 1.5,
            bcolor: 1.5,
            ease:Quart.easeInOut
        });
    },
    darker: function() {
        this.perlin.redhell = false; // 10 1 0.1 1.2
        TweenMax.to(this.perlin, 1, {
            //speed: 0.5,
            eqcolor: 9.0,
            rcolor: 0.4,
            gcolor: 0.05,
            bcolor: 0.6,
            ease:Quart.easeInOut
        });
    },
    volcano: function() {
        this.perlin.redhell = false; // 10 1 0.1 1.2
        //this.perlin.speed = 0.83;

        TweenMax.to(this.perlin, 1, {
            size: 0.7,
            waves: 0.6,
            complex: 1.0,
            displace: 0.3,
            eqcolor: 9.0,
            rcolor: 0.85,
            gcolor: 0.05,
            bcolor: 0.32,
            ease:Quart.easeInOut
        });
    },
    cloud: function() {
        this.perlin.redhell = true; // 10 1 0.1 1.2
        //this.perlin.speed = 0.1;

        TweenMax.to(this.perlin, 1, {
            size: 1.0,
            waves :20.0,
            complex: 0.1,
            displace: 0.1,
            eqcolor: 4.0,
            rcolor: 1.5,
            gcolor: 0.7,
            bcolor: 1.5,
            ease:Quart.easeInOut
        });
    },
    tornasol: function() {
        this.perlin.redhell = true; // 10 1 0.1 1.2
        //this.perlin.speed = 0.25;

        TweenMax.to(this.perlin, 1, {
            size: 1.0,
            waves: 3.0,
            complex: 0.65,
            displace: 0.5,
            eqcolor: 9.5,
            rcolor: 1.5,
            gcolor: 1.5,
            bcolor: 1.5,
            ease:Quart.easeInOut
        });
    }
}

// function createGUI() {
//     const gui = new dat.GUI();
//
//     var perlinGUI = gui.addFolder('Shape Setup');
//     perlinGUI.add(options, 'perlinRandom').name('• Random Shape');
//     perlinGUI.add(options.perlin, 'speed', 0.1, 1.0).name('Speed').listen();
//     perlinGUI.add(options.perlin, 'size', 0.0, 3.0).name('Size').listen();
//     //perlinGUI.add(options.perlin, 'decay', 0.0, 1.0).name('Decay').listen();
//     perlinGUI.add(options.perlin, 'waves', 0.0, 20.0).name('Waves').listen();
//     perlinGUI.add(options.perlin, 'complex', 0.1, 1.0).name('Complex').listen();
//     perlinGUI.add(options.perlin, 'displace', 0.1, 2.5).name('Displacement').listen();
//     //perlinGUI.open();
//
//     var colorGUI = gui.addFolder('Color');
//     colorGUI.add(options, 'random').name('• Random colors');
//     colorGUI.add(options, 'normal').name('• Normal colors');
//     colorGUI.add(options, 'darker').name('• Dark colors');
//     colorGUI.add(options.perlin, 'eqcolor', 0.0, 30.0).name('Hue').listen();
//     colorGUI.add(options.perlin, 'rcolor', 0.0, 2.5).name('R').listen();
//     colorGUI.add(options.perlin, 'gcolor', 0.0, 2.5).name('G').listen();
//     colorGUI.add(options.perlin, 'bcolor', 0.0, 2.5).name('B').listen();
//     colorGUI.add(options.perlin, 'redhell', true).name('Electroflow');
//
//     //colorGUI.open();
//
//     gui.add(options, 'volcano').name('• Volcano');
//     gui.add(options, 'tornasol').name('• Tornasol');
//     gui.add(options, 'cloud').name('• Cotton Candy');
//     gui.add(options.perlin, 'points', true).name('Points');
// }
//--------------------------------------------------------------------
function animation({renderer, scene, camera},primitive) {
    console.log('animation')
    primitive.resetMat(options)
    requestAnimationFrame(() => animation({renderer, scene, camera},primitive));
    renderer.render(scene, camera);
}
