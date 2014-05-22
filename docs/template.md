# `Pui.tmpl(templateString, [data], [settings])`

### API参考

* `templateString {String}` : 模板文本，

* `data {Object}` : 模板数据

* `settings {Object}` : 基本配置信息，一般不予传递


[underscore.js template](http://www.css88.com/doc/underscore/#template)

Pui提供的template，是修改自underscore的，其源码可查看 https://github.com/baofen14787/Underscore-template


### 说明

模板函数可以使用 <%= … %>插入变量, 也可以用<% … %>执行任意的 JavaScript 代码。

```js
var compiled = Pui.tmpl("hello: <%= name %>");
compiled({name: 'moe'});
// "hello: moe"


var template = Pui.tmpl("<b><%- value %></b>");
template({value: '<script>'});
//"<b>&lt;script&gt;</b>"


var view = {
  x: 7,
  template: Pui.tmpl('<b><%- this.x %></b>')
};
view.template();
// <b>7</b>

```

更复杂的一个栗子
```html

<script type="text/html" id='table-data'>

    <% $.each(items,function(key,data){ %>
    <tr>
        <td><%= key %></td>
        <td><%= data.name %></td>
    </tr>
    <% }) %>

</script>

```

```js
var items = [
        {name:"Nick"},
        {name:"Lee"},
        {name:"Jenny"},
        {name:"Julie"},
        {name:"Dennis"},
        {name:"Shawn"},
        {name:"Justin"},
        {name:"Scott"},
        {name:"John"},
        {name:"Sherell"},
        {name:"Janie"},
        {name:"Graham"},
        {name:"Erica"}
    ];

    var tableTemplate = $("#table-data").html();

    $("table.outer tbody").html(Pui.tmpl(tableTemplate,{items:items}));
```

具体demo可以查看源码目录的example/demo_tmpl.html 文件