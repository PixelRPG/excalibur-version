# PixelPRG Engine (Excalibur version)

[Excalibur](https://excaliburjs.com/) + [Typescript](https://www.typescriptlang.org/) + [Esbuild](https://esbuild.github.io/) + [Built-in ECS](https://excaliburjs.com/docs/entity-component-system).

https://user-images.githubusercontent.com/1073989/142873783-8e1973ba-beed-4b3f-ad4f-7c93d11042fc.mp4

This is an experimental 2D engine designed for SNES style RPG games. Currently I'm trying to find out which engine is best suited for this and meets my requirements. For this there is an alternative attempt [build in Phaser 3 + Javelin (ECS)](https://github.com/PixelRPG/excalibur-version).
## Build

Required engine:  
node: >=16  
npm: >=7  

```bash
git clone --recurse-submodules https://github.com/PixelRPG/excalibur-version.git
cd excalibur-version
npm install
npm run build
# Start the example game
npm run start
```
