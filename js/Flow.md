##### 1、场景描述
###### 丸美二期后台管理前端富文本编辑器编辑微信公众号页面，富文本编辑器用的是wangeditor,改源码上传视频，原来的功能是把网上链接插入iframe放进去 
    
##### 2、wangeditor源码
###### 1.包装了原生的选择器，还有操作dom元素的方法，在上传文件时增加input file 元素但是用diaplay：none；隐藏起来，同页面多个上传给id加random字符串，
###### 2.一个组件就是一个对象，比如说panel、menu，也可以通过继承增加原对象的功能。
###### 3.核心对象是editor对象，许多核心方法都放在里面，通过构造函数传值其他对象都可以使用该对象中的方法。
````js
function Img(editor){
    this.editor=editor;
}
Img.prototype={
    insert: function insert(){
    
    }

}
````
###### 3、视频属于大文件上传
####### 1、 使用post上传视频，但是上传图片可以，传视频就报错net::ERR_CONNNECTION_ABORTED,这是由于文件过大的话，http服务器没有读全客户端http请求
####### 时就会中断连接，服务器不能继续读取请求而过早中断连接，服务器中断链接意味着客户端在接受到服务起响应之前不再浪费带宽。
####### 2、 xhr status 等于0，有好多种情况。



##### 1、场景描述
###### 丸美二期富文本编辑微信公众号页面，wangeditor二次开发增加本地视频上传功能，组件名换成@hxy/wangeditor，但是之后就一直报错说找不到@hxy/wangeditor这个文件夹，
###### 但是其实是没有找到入口文件，因为引入路径只有import E from wangEditor。

##### 2、nodejs 模块查找策略  https://blog.csdn.net/handsomexiaominge/article/details/96461786?utm_medium=distribute.pc_relevant.none-task-blog-title-1&spm=1001.2101.3001.4242

##### 3、组件放入私有仓库和组件放入github已及nrm的使用，切换仓库源，npm下载github仓库组件，npm install git+https://github.com/xxx --save


##### 1、场景描述
###### 修改bug element-ui 组件库里面有 input框的组件，有一个属性clearable（如使用v-model会自己双向数据绑定属性置空） 会配合clear事件使用（供用户自定义方法调用），
###### input 组件源码有前后置元素放div，前后置图标放span限制啊，比如密码啊输入长度，用插槽插入用户自定义，还有文本域，以后做组件要多了解element-ui源码。