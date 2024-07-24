
 import copy from 'rollup-plugin-copy'


export default {
    input: "src/index.js",
    output: [
        {
            file: "dist/index.esm.js",
            format: "es",
        },
    ],
    plugins: [ copy({
        targets: [
          { src: 'reps', dest: 'dist/' },
          { src: 'levels', dest: 'dist/' },
          { src: 'assets', dest: 'dist/' },
        ]
      }) ],
};