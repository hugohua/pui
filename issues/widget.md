# Pui.widget( name [, base ], prototype )

### API参考

http://api.jqueryui.com/jquery.widget/

widget 提供了一个创建jQ组件的方法，通过Pui.widget("pp.plugin",{}) 创建的组件，PUI会自动桥接成 $("#id").plugin() 的模式调用

## widget 基础模板

```js

//插件的格式是 命名空间.插件名称 （必须带有命名空间）
//命名空间建议使用项目名称 ，比如拍拍：pp
Pui.widget('pp.template',{
    /**
     *
     * 插件默认的配置参数
     * 同时也会暴露出去给外部重置和修改
     */
    options:{
        defaultVal1     :   1,
        defaultVal2     :   2
    },

    /**
     * 插件创建
     * @method _create
     * 插件创建并初始化时调用，同一个dom下的实例仅调用一次，类似于我们平时写插件时的init方法。
     * 注意：在方法名称前面加 "_" ，表示插件的私有方法，外部调用私有方法会抛出异常（PUI里面做了限制）
     * @private
     */
    _create:function(){
        //在这里做相关的初始化工作

        //$el是插件默认的外层容器、
        //比如 $('#id').template() 其中$('#id')就是this.$el
        this.$child = this.$el.find('.child')
    },

    /**
     * 移除插件
     * @private
     */
    _destroy: function() {
        //通过_supper(),_superApply()方法来调用父类的同名方法
        return this._super();
    },

    /**
     * 自定义方法
     * @private
     */
    _initEvent:function(){
        //绑定事件
        this._on();
        //
        this._off();
        //
        this._trigger();
    },

    /**
     * 提供给外部调用的方法
     */
    pubFunc:function(){

    }
});
```

上面模板是创建一个插件的基本template，插件如果没有提供父类插件的话，都默认继承Pui.base类。

通过widget创建的插件，确保了在同一dom下只实例化一次
```js
var t = $('#id').template("instance")
//或者  var t = $('#id').template().data('pp-template')

//t是插件的对象
console.log(t);
//通过t调用插件的公共方法
t.pubFunc();
```

同时插件提供了自定义选择器用于选中插件的jq对象

```js
$(':pp-template') //表示选中所有具有template对象的dom节点
```

## 关于事件绑定

#### _on( [suppressDisabledCheck ] [, element ], handlers )

Pui Base类里面的 _on 事件对jquery的on做了进一步封装。

在插件内使用_on绑定有2个好处：
1.  保持事件内的this指向，this始终指向插件本身。
2.  通过_on绑定会自动添加命名空间，防止事件相互干扰。如 _on('click') 实际上就是 _on(click.plugin)


参数说明：

*  suppressDisabledCheck: (string) 默认值：false 。是否要绕过禁用的检查
*  element: (jq object) 默认值：this.$el 。要绑定事件处理程序的元素。
*  handlers: (object) 一个 map，其中字符串键代表事件类型，可选的选择器用于授权，值代表事件调用的处理函数。

栗子:
```js
//给插件内所有a标签绑定click事件
this._on({
  "click a": function( event ) {
    event.preventDefault();
  }
});


//给window绑定resize和scroll事件
this._on(this.$win,{
    'resize':function(){},
    'scroll':function(){}
})

//给插件内的li绑定mouseenter事件
this._on(this.$el.find('li'),{
    'mouseenter':function(){}
})
```

## 原理

上面的例子，通过Pui.widget()创建的插件，实际上是创建了 Pui.pp.template 对象。

而Pui.pp.template对象再通过 Pui.bridge方法 将 Pui.pp.template 转成 $('#id').template() jq插件的通用形式;

也就是说，你也同样可以通过如下形式初始化插件:

```js
Pui.pp.template($('#id'),{//插件参数})
```

widget 内部实现了继承，默认不写base参数的话 统一继承自Pui.base 对象.