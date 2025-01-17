module.exports = async (suite, name, brighterscript, projectPath, options) => {
    const { ProgramBuilder } = brighterscript;

    const builder = new ProgramBuilder();
    //run the first run
    await builder.run({
        cwd: projectPath,
        createPackage: false,
        copyToStaging: false,
        //disable diagnostic reporting (they still get collected)
        diagnosticFilters: ['**/*'],
        logLevel: 'error'
    });
    //collect all the brs file contents
    const files = Object.values(builder.program.files).filter(x => ['.brs', '.bs', '.d.bs'].includes(x.extension)).map(x => ({
        pkgPath: x.pkgPath,
        fileContents: x.fileContents
    }));
    if (files.length === 0) {
        console.log('[parse-brs] No brs files found in program');
        return;
    }
    suite.add(name, (deferred) => {
        const promises = [];
        const setFileFuncName = builder.program.setFile ? 'setFile' : 'addOrReplaceFile';
        for (const file of files) {
            promises.push(
                builder.program[setFileFuncName](file.pkgPath, file.fileContents)
            );
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.all(promises).then(() => deferred.resolve());
    }, {
        ...options,
        'defer': true
    });
};
