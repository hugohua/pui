# `Pui.add(name,func)`

用来定义模块。`Pui` 推荐一个模块一个文件，虽然目前尚未实现seajs、requireJs的按需加载，但是遵循统一的规范有利于团队代码的统一

### *参数*

*  `name {String}` 页面模块名称，该名称具有唯一性，通过`add`方法创建的模块会自动挂载自`Pui[name]`上。
*  `func {Function}` 页面模块的处理逻辑函数。`func`有两个参数`exports`、`P`


### 最佳实践（范例）
```js
Pui.add('page1',function(exports,P){

    //通过exports 添加的方法会自动挂载自 Pui.page1对象下面
    //eg：外界调用getData方法可使用Pui.page1.getData
    exports.getData = function(){

    };

    //模块创建后会自动执行init方法。
    exports.init = function(){ /* code */ };

    //模块创建后 1.5s 后自动执行
    exports.lazyInit = function(){ /* code */ };

    //模块创建后 等页面所有资源下载完后执行
    exports.winLoad = function(){ /* code */ };

    //私有方法
    var priFunc = function(){
        //P指向Pui
        P.$win.on('click',function(){})

    };

})
```

说明：`init` 、 `lazyInit` 、 `winLoad` 是`add`方法内提供的3种初始化方式。合理的安排初始化时间，能防止函数同一时间执行而引起的CPU突然暴增，及页面加载瞬间卡顿等问题。

通过`exports` 添加的方法会自动挂载自 `Pui[name]`对象下面

### 范例二
```js
Pui.add('page1',function(){

    var obj = {
        getData:function(){ /* code */ },

        init:function(){ /* code */ };
    };

    return obj;

})
```

通过`return`的方式将对象暴露给外界调用。

