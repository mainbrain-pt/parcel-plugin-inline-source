const fs = require('fs');
const process = require('process');
const { inlineSource } = require('inline-source');

async function hndDeleteSource(source, context) {
    if (source.filepath)
        fs.unlink(source.filepath, (err) => {
            if (err) throw err;
        });
    return Promise.resolve();
}

module.exports = bundler => {
    if (process.env.NODE_ENV === 'production') {
        bundler.on('bundled', bundle => {
            const bundles = Array.from(bundle.childBundles).concat([bundle]);
            return Promise.all(
                bundles.map(async bundle => {
                    //console.log("bundle:", bundle.name);
                    if (bundle.entryAsset && bundle.entryAsset.type === 'html') {
                        let html = await inlineSource(bundle.name, {
                            rootpath: bundle.entryAsset.options.outDir,
                            htmlpath: bundle.name,
                            saveRemote: false,
                            handlers: [hndDeleteSource]
                        });
                        fs.writeFileSync(bundle.name, html);
                    }
                })
            );
        });
    }
};
