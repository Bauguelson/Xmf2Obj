# Convert Cal3D XMF files to OBJ format

# How it's work ?
- Convert ``<VERTEX>`` to OBJ ``v``, ``vn``, ``vt``
- Convert ``<FACE>`` to OBJ ``f``

# How to install ?
```
git clone https://github.com/Bauguelson/Xmf2Obj.git
cd Xmf2Obj
npm install fast-xml-parser
```

# How to use ?

```
node xmf2obj.js source.xmf destination.obj
```
