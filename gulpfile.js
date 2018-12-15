"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
const gulp = require("gulp");
const tsc = require("gulp-typescript");

//******************************************************************************
//* SOURCE
//******************************************************************************
const tsLibProject = tsc.createProject("tsconfig.json", {
    module: "commonjs"
});

const tsDtsProject = tsc.createProject("tsconfig.json", {
    declaration: true,
    noResolve: false
});


function buildLib() {

    return gulp.src(["src/**/*.ts"])
        .pipe(tsLibProject())
        .on("error", function(err) {
            process.exit(1);
        })
        .js.pipe(gulp.dest("dist"));
}

function buildDts() {

    return gulp.src(["src/**/*.ts"])
        .pipe(tsDtsProject())
        .on("error", function(err) {
            process.exit(1);
        })
        .dts.pipe(gulp.dest("dts"));
}

const build = gulp.series(buildLib, buildDts);


exports.buildLib = buildLib;
exports.buildDts = buildDts;
exports.buildLib = build;

//******************************************************************************
//* DEFAULT
//******************************************************************************
exports.default = build;
