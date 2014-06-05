# 常用API参考

### Pui.supports(name)

检测浏览器是否支持css3属性

返回值 `{true|false}`  若支持css3属性，返回`true` 否则是 `false`

例子:

```js
//判断是否支持css3  Transition 动画属性
P.supports("Transition")
```

### Pui.throttle(func,wait,[options])


* `func {function}` : 需要`wait`执行的函数，

* `wait {number}` : 等待时间，单位毫秒

* `options {Object}` : 可选的 控制对象

创建并返回一个像节流阀一样的函数，当重复调用函数的时候，最多每隔 wait毫秒调用一次该函数。

默认情况下，throttle将在你调用的第一时间尽快执行这个function，并且，如果你在wait周期内调用任意次数的函数，都将尽快的被覆盖。如果你想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}。


```js
var throttled = Pui.throttle(updatePosition, 100);
$(window).scroll(throttled);
```

####应用场景

* 鼠标移动，mousemove 事件
* DOM 元素动态定位，window对象的resize和scroll 事件
* 需要频繁操作dom的函数

### Pui.debounce(func,wait,[immediate])


* `func {function}` : 需要`wait`执行的函数，

* `wait {number}` : 等待时间，单位毫秒

* `immediate {Object}` : 传参 `immediate` 为 `true` 会让debounce 在 `wait` 间隔之后 触发最后的函数调用而不是最先的函数调用.在类似不小心点了提交按钮两下而提交了两次的情况下很有用. 如果为`false`,则绑定的函数先执行，而不是delay后后执行。


当该函数被调用，wait毫秒后才执行，这里参考underscore 的 debounce 实现。

debounce是空闲时间必须大于或等于 一定值的时候，才会执行调用方法。debounce是空闲时间的间隔控制。比如我们做autocomplete，这时需要我们很好的控制输入文字时调用方法时间间隔。一般时第一个输入的字符马上开始调用，根据一定的时间间隔重复调用执行的方法。对于变态的输入，比如按住某一个建不放的时候特别有用。

####应用场景

* 文本输入keydown 事件，keyup 事件，例如做autocomplete
* 需要频繁操作dom的函数


```js

var lazyLayout = Pui.debounce(calculateLayout, 300);
$(window).resize(lazyLayout);

```

####`debounce()`和`throttle()` 区别

debounce()和throttle()两个方法非常相似（包括调用方式和返回值），作用却又有不同。

它们都是用于函数节流，控制函数不被频繁地调用，节省客户端及服务器资源。

* debounce()方法关注函数执行的间隔，即函数两次的调用时间不能小于指定时间。
* throttle()方法更关注函数的执行频率，即在指定频率内函数只会被调用一次。


###Pui.detector

客户端信息检测对象

不需要调用，直接使用即可。

提供如下几种常见的客户端信息检测。

```js


console.log(Pui.detect);
//Pui.detect对象包含以下几个信息
Pui.detect = {
    os:'windows',
    engine:'trident',
    browser:'ie',
    version:'9'
}


```

注意：只有ie才会显示`version`，其他浏览器版本感觉作用不大，没做检测。

* `os` 可取的值有：`windows`、`ipad`、`ipod`、`iphone`、`mac`、`linux`
* `engine` 可取的值有：`trident`、`webkit`、`gecko`、`presto`、
* `browser` 可取的值有：`ie`、`firefox`、`opera`、`chrome`、`safari`
* `version` 可取的值有：`6`、`7`、`8`、`9`、`10`


###Pui.loadAsset($warp)

* `$warp` {jquery} jq对象容器

懒加载容器内的资源文件(如：image、iframe)

建议绑定jq的`one`事件，只需要调用一次即可。