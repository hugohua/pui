/**
 * 自动化脚本定义
 */
module.exports = function (grunt) {
    'use strict';

    //load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    //define tasks
    //暂时去掉'jshint' ,模板编译不过。。囧
    grunt.registerTask('default', ['concat', 'uglify'])
//    删除yuidoc
//    grunt.registerTask('theme',['gitclone'])
    grunt.registerTask('office', ['concat', 'uglify', 'copy'])

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
                src: ['src/core/intro.js', 'src/core/core.js','src/core/utils.js', 'src/core/widget.js', 'src/core/base.js', 'src/core/bridge.js', 'src/core/outro.js','src/extend/*.js'],
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
            dist:{
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.core.dest %>'],
                    'dist/<%= pkg.name %>.widget.min.js':['<%= concat.widget.dest %>']
                }
            }
        },
        //办公环境下copy
        copy: {
            main: {
                files: [
                    // includes files within path
                    {expand: true,flatten: true,  src: ['dist/**'], dest: 'E:/ecc_UEDFD_rep/paipai/base/js/libs', filter: 'isFile'}
                ]
            }
        },
        //加载yuidoc theme
        gitclone: {
            clone: {
                options: {
                    repository: 'https://github.com/crossjs/yuidoc-bootstrap.git',
                    directory: 'theme'
                }
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
                    themedir: "yuidoc-bootstrap",
                    outdir: 'docs/'
                }
            }
        }



    })
}