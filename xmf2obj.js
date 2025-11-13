// Cal3D XMF To OBJ converter
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const xmfFile = process.argv[2];
const objFile = process.argv[3];

if (!xmfFile || !objFile) {
    console.error('Usage: node xmfToObj.js input.xmf output.obj');
    process.exit(1);
}

const xmlData = fs.readFileSync(xmfFile, 'utf8');

const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseNodeValue: false,
    parseAttributeValue: false,
    trimValues: true,
};

const parser = new XMLParser(options);
const parsed = parser.parse(xmlData);
console.log(parsed);

const asArray = (obj) => (Array.isArray(obj) ? obj : obj ? [obj] : []);

const vertices = [];
const normals = [];
const uvs = [];
const faces = [];
const vertexMap = {};
let vertexCounter = 1;

const meshes = asArray(parsed.MESH);

meshes.forEach((mesh) => {
  const submeshes = asArray(mesh.SUBMESH);
    submeshes.forEach((submesh) => {
        const verts = asArray(submesh.VERTEX);

        verts.forEach((v) => {
            const id = v.ID;
            if (!id || !v.POS || !v.NORM) return;

            const pos = v.POS.split(/\s+/).map(Number);
            const norm = v.NORM.split(/\s+/).map(Number);
            const tex = v.TEXCOORD ? v.TEXCOORD.split(/\s+/).map(Number) : [0, 0];

            vertices.push(`v ${pos[0]} ${pos[1]} ${pos[2]}`);
            normals.push(`vn ${norm[0]} ${norm[1]} ${norm[2]}`);
            uvs.push(`vt ${tex[0]} ${tex[1]}`);

            vertexMap[id] = vertexCounter++;
        });

        const rawFaces = asArray(submesh.FACE);
        rawFaces.forEach((f) => {
            if (typeof f !== 'object' || !f.VERTEXID) {
                if (typeof f === 'string' && f.trim() === '') {
                    console.warn('Empty FACE element ignored.');
                }
                return;
            }

            const ids = f.VERTEXID.split(/\s+/);
            const faceLine = ids
                .map((id) => {
                    const idx = vertexMap[id];
                    if (!idx) throw new Error(`FACE references unknown vertex ID ${id}`);
                    return `${idx}/${idx}/${idx}`; // v/vt/vn
                })
                .join(' ');

            faces.push(`f ${faceLine}`);
        });
    });
});

const objContent = [...vertices, ...uvs, ...normals, ...faces].join('\n');
fs.writeFileSync(objFile, objContent, 'utf8');

console.log(`Successfully converted ${xmfFile} → ${objFile}`);