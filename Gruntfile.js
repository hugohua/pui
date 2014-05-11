/**
 * 自动化脚本定义
 */
module.exports = function (grunt) {
    'use strict';

    //load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    //define tasks
    grunt.registerTask('default', ['concat','jshint' , 'uglify', 'yuidoc'])

    var pkg = grunt.file.readJSON('package.json')

    var banner = '/*\n' +
        ' * <%= pkg.name %> <%= pkg.version %>\n' +
        ' * <%= pkg.description %>\n' +
        ' *\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
        ' *\n' +
        ' * Licensed under <%= pkg.license.join(" & ") %>\n' +
        ' *\n' +
        ' * Released on: <%= grunt.template.today("mmmm d, yyyy") %>\n' +
        '*/\n'


    grunt.initConfig({
        pkg: pkg,
        //代码校验
        jshint: {
            src: ['src/*/*.js'],
            //more:http://www.jshint.com/docs/options/
            options: {
                //排除文件
                ignores: ['src/core/intro.js','src/core/outro.js'],
                eqeqeq: true,
                devel: true,
                asi:true,       //忽略分号
                globals: {
                    jQuery: true,
                    console: true
                }
            }
        },
        //合并文件
        concat: {
            options: {
                //文件内容的分隔符
                separator: '\n',
                stripBanners: true,
                banner: banner
            },
            core: {
                src: ['src/core/intro.js', 'src/core/core.js', 'src/core/widget.js', 'src/core/base.js', 'src/core/bridge.js', 'src/core/outro.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
            widget: {
                src: ['src/widget/*.js'],
                dest: 'dist/<%= pkg.name %>.widget.js'
            }
        },
        //压缩
        uglify: {
            //文件头部输出信息
            options: {
                banner: banner
            },
            //具体任务配置
            files: {
                'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js'],
                'dist/<%= pkg.name %>.widget.min.js':['dist/<%= pkg.name %>.widget.js']
            }
        },
        //生成文档
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/',
                    themedir: 'theme/',
                    outdir: 'docs/'
                }
            }
        }



    })
}