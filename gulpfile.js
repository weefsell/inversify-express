"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
const gulp = require("gulp");
const tsc = require("gulp-typescript");
const runSequence = require("run-sequence");

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

gulp.task("build-lib", function () {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsLibProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .js.pipe(gulp.dest("dist"));
});

gulp.task("build-dts", function () {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsDtsProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .dts.pipe(gulp.dest("dts"));
});

gulp.task("build", function (cb) {
    runSequence(
        ["build-lib", "build-dts"], // tests + build es and lib
        cb
    );
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
    runSequence(
        "build",
        cb
    );
});
