import { Document, NodeIO } from '@gltf-transform/core';
import { unpartition } from '@gltf-transform/functions';
import sharp from 'sharp';

const TOP = './images/top.png';
const FRONT = './images/front.png';
const SIDE = './images/side.png';

const io = new NodeIO();
const doc = new Document();

const vertices = [
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5],
];

const faces = [
  // Front face
  [0, 1, 2, 3],
  // Top face
  [1, 5, 6, 2],
  // Right face
  [5, 4, 7, 6],
  // Left face
  [4, 0, 3, 7],
  // Bottom face
  [3, 2, 6, 7],
  // Back face
  [4, 5, 1, 0],
];

const indices = faces.reduce((acc, face) => {
  acc.push(face[0], face[1], face[2], face[0], face[2], face[3]);
  return acc;
}, []);

const primitive = doc.createPrimitive();

const topImage = await sharp(TOP).resize(512, 512).toBuffer();
const frontImage = await sharp(FRONT).resize(512, 512).toBuffer();
const sideImage = await sharp(SIDE).resize(512, 512).toBuffer();

// Create materials
const topMaterial = doc.createMaterial('topMaterial')
    .setBaseColorTexture(doc.createTexture().setImage(topImage).setMimeType('image/png'));
const frontMaterial = doc.createMaterial('frontMaterial')
    .setBaseColorTexture(doc.createTexture().setImage(frontImage).setMimeType('image/png'));
const sideMaterial = doc.createMaterial('sideMaterial')
    .setBaseColorTexture(doc.createTexture().setImage(sideImage).setMimeType('image/png'));

// Set the material on the primitive
primitive.setMaterial(frontMaterial);

// Position
const positionBuffer = doc.createBuffer();
const positionAccessor = doc.createAccessor()
  .setType('VEC3')
  .setArray(new Float32Array(vertices.flat()))
  .setBuffer(positionBuffer);
primitive
  .setAttribute('POSITION', positionAccessor);

//
const indicesBuffer = doc.createBuffer();
const indicesAccessor = doc.createAccessor()
  .setType('SCALAR')
  .setArray(new Uint16Array(indices))
  .setBuffer(indicesBuffer);
primitive.setIndices(indicesAccessor);

const texCoords = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
];
const textcoordsBuffer = doc.createBuffer();
const textcoordsAccessor = doc.createAccessor()
    .setType('VEC2')
    .setArray(new Float32Array(texCoords.flat()))
    .setBuffer(textcoordsBuffer);
primitive.setAttribute('TEXCOORD_0', textcoordsAccessor);

const mesh = doc.createMesh().addPrimitive(primitive);
const node = doc.createNode().setMesh(mesh);
const scene = doc.createScene().addChild(node);

doc.getRoot().setDefaultScene(scene);

await doc.transform(unpartition());

await io.write('model.glb', doc);
