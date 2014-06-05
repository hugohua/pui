# Pui.localStore

### API参考

提供操作 localStore 的 基础操作方法

仅支持IE8+，FF、Chrome。接口内部已经做了兼容，若不支持localStore 则直接返回空对象。

同时支持数字、字符串、及对象的存储。

注意：localStore 没有设置过期时间，如不是用户手动清除localStore，则永不过期。但是单个域下的localStore 有(5m)大小限制。


### get `Pui.localStore.get(name)`


获取 localStore 值。

例子:

```js
Pui.localStore.get('foo');
```



### set `Pui.cookie.set(name, value)`

设置 localStore 值。

* `name {String}` : 需要设置的localStore名称，

* `value {number|string|object}` : localStore值，支持3种数据类型（number、string、object）


例子：

```js

    Pui.localStore.set('foo', 3);

    Pui.localStore.set('bar', {
        domain: 'example.com',
        path: '/',
        expires: 30
    });
````


### remove `Pui.localStore.remove(name)`

移除指定的 localStore.

例子：

```js
    Pui.localStore.remove('foo');
````

### clear `Pui.localStore.clear()`

移除本域下面的所有 localStore.

和remove方法的区别是，clear是全部清空。而remove是单个删除。

例子：

```js
    Pui.localStore.clear();
````
