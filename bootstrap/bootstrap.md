##### css组件架构设计思想（css组件的8种基本类型）
    （1）基础样式，例如：btn、alert
    （2）+颜色样式，例如：btn-info、alert-success
    （3）+尺寸样式，例如：btn-ns、btn-sm、btn-lg
    （4）+状态样式，例如：active、disabled
    （5）+特殊样式，例如：dropdown-menu>li>a:hover
    （6）+并列元素样式，例如：btn-group.btn+btn
    （7）+嵌套子元素样式，例如：btn-group.btn-group
    （8）+动画样式，例如：progress.active
##### 以下是一些具有代表性的核心css组件
##### 1、grid.less
````less
//
// Grid system
// --------------------------------------------------


// Container widths
//
// Set the container width, and override it for fixed navbars in media queries.

.container {
// mix-in一个已有class selectors来设置margin和padding
  .container-fixed();

  @media (min-width: @screen-sm-min) {
    width: @container-sm;
  }
  @media (min-width: @screen-md-min) {
    width: @container-md;
  }
  @media (min-width: @screen-lg-min) {
    width: @container-lg;
  }
}


// Fluid container
//
// Utilizes the mixin meant for fixed width containers, but without any defined
// width for fluid, full width layouts.

.container-fluid {
  .container-fixed();
}


// Row
//
// Rows contain and clear the floats of your columns.

.row {
  .make-row();
}


// Columns
//
// Common styles for small and large grid columns

.make-grid-columns();


// Extra small grid
//
// Columns, offsets, pushes, and pulls for extra small devices like
// smartphones.

.make-grid(xs);


// Small grid
//
// Columns, offsets, pushes, and pulls for the small device range, from phones
// to tablets.

@media (min-width: @screen-sm-min) {
  .make-grid(sm);
}


// Medium grid
//
// Columns, offsets, pushes, and pulls for the desktop device range.

@media (min-width: @screen-md-min) {
  .make-grid(md);
}


// Large grid
//
// Columns, offsets, pushes, and pulls for the large desktop device range.

@media (min-width: @screen-lg-min) {
  .make-grid(lg);
}

````
````less
// Centered container element
// 设置好一个常量在 class selectors 里做计算，这样只要改一个常量就调整了全部相关的样式
@grid-gutter-width:         30px;
.container-fixed(@gutter: @grid-gutter-width) {
  margin-right: auto;
  margin-left: auto;
  padding-left:  floor((@gutter / 2));
  padding-right: ceil((@gutter / 2));
  // 继承一个已有的class selectors,把所有的clearfix替换成container-fixed
  &:extend(.clearfix all);
}

.clearfix() {
  &:before,
  &:after {
    content: " "; // 1
    display: table; // 2
  }
  &:after {
    clear: both;
  }
}
.make-row(@gutter: @grid-gutter-width) {
  margin-left:  ceil((@gutter / -2));
  margin-right: floor((@gutter / -2));
  &:extend(.clearfix all);
}
// 递归创建栅格
.make-grid-columns() {
  // Common styles for all sizes of grid columns, widths 1-12
  .col(@index) { // initial
    @item: ~".col-xs-@{index}, .col-sm-@{index}, .col-md-@{index}, .col-lg-@{index}";
    .col((@index + 1), @item);
  }
  .col(@index, @list) when (@index =< @grid-columns) { // general; "=<" isn't a typo
    @item: ~".col-xs-@{index}, .col-sm-@{index}, .col-md-@{index}, .col-lg-@{index}";
    .col((@index + 1), ~"@{list}, @{item}");
  }
  .col(@index, @list) when (@index > @grid-columns) { // terminal
    @{list} {
      position: relative;
      // Prevent columns from collapsing when empty
      min-height: 1px;
      // Inner gutter via padding
      padding-left:  ceil((@grid-gutter-width / 2));
      padding-right: floor((@grid-gutter-width / 2));
    }
  }
  .col(1); // kickstart it
}

.float-grid-columns(@class) {
  .col(@index) { // initial
    @item: ~".col-@{class}-@{index}";
    .col((@index + 1), @item);
  }
  .col(@index, @list) when (@index =< @grid-columns) { // general
    @item: ~".col-@{class}-@{index}";
    .col((@index + 1), ~"@{list}, @{item}");
  }
  .col(@index, @list) when (@index > @grid-columns) { // terminal
    @{list} {
      float: left;
    }
  }
  .col(1); // kickstart it
}

.calc-grid-column(@index, @class, @type) when (@type = width) and (@index > 0) {
  .col-@{class}-@{index} {
    width: percentage((@index / @grid-columns));
  }
}
.calc-grid-column(@index, @class, @type) when (@type = push) and (@index > 0) {
  .col-@{class}-push-@{index} {
    left: percentage((@index / @grid-columns));
  }
}
.calc-grid-column(@index, @class, @type) when (@type = push) and (@index = 0) {
  .col-@{class}-push-0 {
    left: auto;
  }
}
.calc-grid-column(@index, @class, @type) when (@type = pull) and (@index > 0) {
  .col-@{class}-pull-@{index} {
    right: percentage((@index / @grid-columns));
  }
}
.calc-grid-column(@index, @class, @type) when (@type = pull) and (@index = 0) {
  .col-@{class}-pull-0 {
    right: auto;
  }
}
.calc-grid-column(@index, @class, @type) when (@type = offset) {
  .col-@{class}-offset-@{index} {
    margin-left: percentage((@index / @grid-columns));
  }
}

// Basic looping in LESS
.loop-grid-columns(@index, @class, @type) when (@index >= 0) {
  .calc-grid-column(@index, @class, @type);
  // next iteration
  .loop-grid-columns((@index - 1), @class, @type);
}

// Create grid for specific class
.make-grid(@class) {
  .float-grid-columns(@class);
  .loop-grid-columns(@grid-columns, @class, width);
  .loop-grid-columns(@grid-columns, @class, pull);
  .loop-grid-columns(@grid-columns, @class, push);
  .loop-grid-columns(@grid-columns, @class, offset);
}
````
##### 2、buttons.less
````less
//btn的基础样式
.btn {
  display: inline-block;
  margin-bottom: 0; // For input.btn
  font-weight: @btn-font-weight;
  text-align: center;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none; // Reset unusual Firefox-on-Android default style; see https://github.com/necolas/normalize.css/issues/214
  border: 1px solid transparent;
  white-space: nowrap;
  //数字相关，改动多的地方集中在一个函数里用变量便于修改
  .button-size(@padding-base-vertical; @padding-base-horizontal; @font-size-base; @line-height-base; @btn-border-radius-base);
  //css3 hack集中在一个函数里统一用变量设置
  .user-select(none);
  //状态样式
  &,
  &:active,
  &.active {
    &:focus,
    &.focus {
      .tab-focus();
    }
  }

  &:hover,
  &:focus,
  &.focus {
    color: @btn-default-color;
    text-decoration: none;
  }

  &:active,
  &.active {
    outline: 0;
    background-image: none;
    //css3阴影 hack放在一个方法里统一用一个变量设置
    .box-shadow(inset 0 3px 5px rgba(0,0,0,.125));
  }

  &.disabled,
  &[disabled],
  //h5元素设置disabled属性，子元素那些输入的元素都被禁用了
  fieldset[disabled] & {
    cursor: @cursor-disabled;
    .opacity(.65);
    .box-shadow(none);
  }

  a& {
    &.disabled,
    fieldset[disabled] & {
      pointer-events: none; // Future-proof disabling of clicks on `<a>` elements
    }
  }
}


// Alternate buttons
// --------------------------------------------------
//颜色样式组件 抽象出相同的方法 仅仅只是设置变量的不同
.btn-default {
  .button-variant(@btn-default-color; @btn-default-bg; @btn-default-border);
}
.btn-primary {
  .button-variant(@btn-primary-color; @btn-primary-bg; @btn-primary-border);
}
// Success appears as green
.btn-success {
  .button-variant(@btn-success-color; @btn-success-bg; @btn-success-border);
}
// Info appears as blue-green
.btn-info {
  .button-variant(@btn-info-color; @btn-info-bg; @btn-info-border);
}
// Warning appears as orange
.btn-warning {
  .button-variant(@btn-warning-color; @btn-warning-bg; @btn-warning-border);
}
// Danger and error appear as red
.btn-danger {
  .button-variant(@btn-danger-color; @btn-danger-bg; @btn-danger-border);
}


// Link buttons
// -------------------------

// Make a button look and behave like a link
.btn-link {
  color: @link-color;
  font-weight: normal;
  border-radius: 0;

  &,
  &:active,
  &.active,
  &[disabled],
  fieldset[disabled] & {
    background-color: transparent;
    .box-shadow(none);
  }
  &,
  &:hover,
  &:focus,
  &:active {
    border-color: transparent;
  }
  &:hover,
  &:focus {
    color: @link-hover-color;
    text-decoration: @link-hover-decoration;
    background-color: transparent;
  }
  &[disabled],
  fieldset[disabled] & {
    &:hover,
    &:focus {
      color: @btn-link-disabled-color;
      text-decoration: none;
    }
  }
}


// Button Sizes
// --------------------------------------------------
//尺寸样式组件 抽象出相同的方法 仅仅只是设置变量的不同
.btn-lg {
  // line-height: ensure even-numbered height of button next to large input
  .button-size(@padding-large-vertical; @padding-large-horizontal; @font-size-large; @line-height-large; @btn-border-radius-large);
}
.btn-sm {
  // line-height: ensure proper height of button next to small input
  .button-size(@padding-small-vertical; @padding-small-horizontal; @font-size-small; @line-height-small; @btn-border-radius-small);
}
.btn-xs {
  .button-size(@padding-xs-vertical; @padding-xs-horizontal; @font-size-small; @line-height-small; @btn-border-radius-small);
}


// Block button
// --------------------------------------------------

.btn-block {
  display: block;
  width: 100%;
}

// Vertically space out multiple block buttons
//并列元素样式
.btn-block + .btn-block {
  margin-top: 5px;
}

// Specificity overrides
input[type="submit"],
input[type="reset"],
input[type="button"] {
  &.btn-block {
    width: 100%;
  }
}

````
##### mixins\buttons.less
````less
// Button variants
//
// Easily pump out default styles, as well as :hover, :focus, :active,
// and disabled options for all buttons

.button-variant(@color; @background; @border) {
  color: @color;
  background-color: @background;
  border-color: @border;

  &:focus,
  &.focus {
    color: @color;
    background-color: darken(@background, 10%);
        border-color: darken(@border, 25%);
  }
  &:hover {
    color: @color;
    background-color: darken(@background, 10%);
        border-color: darken(@border, 12%);
  }
  &:active,
  &.active,
  .open > .dropdown-toggle& {
    color: @color;
    background-color: darken(@background, 10%);
        border-color: darken(@border, 12%);

    &:hover,
    &:focus,
    &.focus {
      color: @color;
      background-color: darken(@background, 17%);
          border-color: darken(@border, 25%);
    }
  }
  &:active,
  &.active,
  .open > .dropdown-toggle& {
    background-image: none;
  }
  &.disabled,
  &[disabled],
  fieldset[disabled] & {
    &:hover,
    &:focus,
    &.focus {
      background-color: @background;
          border-color: @border;
    }
  }

  .badge {
    color: @background;
    background-color: @color;
  }
}

// Button sizes
.button-size(@padding-vertical; @padding-horizontal; @font-size; @line-height; @border-radius) {
  padding: @padding-vertical @padding-horizontal;
  font-size: @font-size;
  line-height: @line-height;
  border-radius: @border-radius;
}

````
##### vendor-prefixes.less
````less
/*
    none：
    文本不能被选择
    text：
    可以选择文本
    all：
    当所有内容作为一个整体时可以被选择。如果双击或者在上下文上点击子元素，那么被选择的部分将是以该子元素向上回溯的最高祖先元素。
    element：
    可以选择文本，但选择范围受元素边界的约束
    
   IE6-9不支持该属性，但支持使用标签属性 onselectstart="return false;" 来达到 user-select:none 的效果；Safari和Chrome也支持该标签属性；
   直到Opera12.5仍然不支持该属性，但和IE6-9一样，也支持使用私有的标签属性 unselectable="on" 来达到 user-select:none 的效果；unselectable 的另一个值是 off；
   除Chrome和Safari外，在其它浏览器中，如果将文本设置为 -ms-user-select:none;，则用户将无法在该文本块中开始选择文本。不过，如果用户在页面的其他区域开始选择文本，则用户仍然可以继续选择将文本设置为 -ms-user-select:none; 的区域文本；
   对应的脚本特性为userSelect。
  */
.user-select(@select) {
  -webkit-user-select: @select;
     -moz-user-select: @select;
      -ms-user-select: @select; // IE10+
          user-select: @select;
}
// Drop shadows
//
// Note: Deprecated `.box-shadow()` as of v3.1.0 since all of Bootstrap's
// supported browsers that have box shadow capabilities now support it.

.box-shadow(@shadow) {
  -webkit-box-shadow: @shadow; // iOS <4.3 & Android <4.1
          box-shadow: @shadow;
}
````
###### tab-focus.less
````less
.tab-focus() {
  // WebKit-specific. Other browsers will keep their default outline style.
  // (Initially tried to also force default via `outline: initial`,
  // but that seems to erroneously remove the outline in Firefox altogether.)
  //设置轮廓为 5 像素宽，且对于基于 webkit 浏览器有一个 -webkit-focus-ring-color 的浏览器扩展。轮廓偏移设置为 -2 像素。
  //关于-webkit-focus-ring-color是一种色彩属性，蓝色，类似outline的蓝颜色，在不同的浏览器版本颜色有稍微的差异
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
````
###### opacity.less
````less
.opacity(@opacity) {
  opacity: @opacity;
  // IE8 filter
  //让ie支持opacity
  @opacity-ie: (@opacity * 100);
  filter: ~"alpha(opacity=@{opacity-ie})";
}
````
##### 3、button-groups.less
````less
//
// Button groups
// --------------------------------------------------

// Make the div behave like a button
.btn-group,
.btn-group-vertical {
  position: relative;
  display: inline-block;
  vertical-align: middle; // match .btn alignment given font-size hack above
  > .btn {
    position: relative;
    float: left;
    // Bring the "active" button to the front
    &:hover,
    &:focus,
    &:active,
    &.active {
      z-index: 2;
    }
  }
}

// Prevent double borders when buttons are next to each other
//嵌套子元素样式
.btn-group {
  //并列元素样式
  .btn + .btn,
  .btn + .btn-group,
  .btn-group + .btn,
  .btn-group + .btn-group {
    margin-left: -1px;
  }
}

// Optional: Group multiple button groups together for a toolbar
.btn-toolbar {
  margin-left: -5px; // Offset the first child's margin
  // 继承一个已有的class selectors,把所有的clearfix替换成btn-toolbar 
  &:extend(.clearfix all);

  .btn,
  .btn-group,
  .input-group {
    float: left;
  }
  > .btn,
  > .btn-group,
  > .input-group {
    margin-left: 5px;
  }
}

.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {
  border-radius: 0;
}

// Set corners individual because sometimes a single button can be in a .btn-group and we need :first-child and :last-child to both match
.btn-group > .btn:first-child {
  margin-left: 0;
  &:not(:last-child):not(.dropdown-toggle) {
    .border-right-radius(0);
  }
}
// Need .dropdown-toggle since :last-child doesn't apply, given that a .dropdown-menu is used immediately after it
.btn-group > .btn:last-child:not(:first-child),
.btn-group > .dropdown-toggle:not(:first-child) {
  .border-left-radius(0);
}

// Custom edits for including btn-groups within btn-groups (useful for including dropdown buttons within a btn-group)
.btn-group > .btn-group {
  float: left;
}
.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {
  border-radius: 0;
}
.btn-group > .btn-group:first-child:not(:last-child) {
  > .btn:last-child,
  > .dropdown-toggle {
    .border-right-radius(0);
  }
}
.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {
  .border-left-radius(0);
}

// On active and open, don't show outline
.btn-group .dropdown-toggle:active,
.btn-group.open .dropdown-toggle {
  outline: 0;
}


// Sizing
//
// Remix the default button sizing classes into new ones for easier manipulation.
// 继承一个已有的class selectors,把所有的btn-xs替换成.btn-group-xs > .btn 
.btn-group-xs > .btn { &:extend(.btn-xs); }
.btn-group-sm > .btn { &:extend(.btn-sm); }
.btn-group-lg > .btn { &:extend(.btn-lg); }


// Split button dropdowns
// ----------------------

// Give the line between buttons some depth
.btn-group > .btn + .dropdown-toggle {
  padding-left: 8px;
  padding-right: 8px;
}
.btn-group > .btn-lg + .dropdown-toggle {
  padding-left: 12px;
  padding-right: 12px;
}

// The clickable button for toggling the menu
// Remove the gradient and set the same inset shadow as the :active state
.btn-group.open .dropdown-toggle {
  .box-shadow(inset 0 3px 5px rgba(0,0,0,.125));

  // Show no shadow for `.btn-link` since it has no other button styles.
  &.btn-link {
    .box-shadow(none);
  }
}


// Reposition the caret
.btn .caret {
  margin-left: 0;
}
// Carets in other button sizes
.btn-lg .caret {
  border-width: @caret-width-large @caret-width-large 0;
  border-bottom-width: 0;
}
// Upside down carets for .dropup
.dropup .btn-lg .caret {
  border-width: 0 @caret-width-large @caret-width-large;
}


// Vertical button groups
// ----------------------

.btn-group-vertical {
  > .btn,
  > .btn-group,
  > .btn-group > .btn {
    display: block;
    float: none;
    width: 100%;
    max-width: 100%;
  }

  // Clear floats so dropdown menus can be properly placed
  > .btn-group {
  // 继承一个已有的class selectors,把所有的clearfix替换成btn-toolbar 
    &:extend(.clearfix all);
    > .btn {
      float: none;
    }
  }

  > .btn + .btn,
  > .btn + .btn-group,
  > .btn-group + .btn,
  > .btn-group + .btn-group {
    margin-top: -1px;
    margin-left: 0;
  }
}

.btn-group-vertical > .btn {
  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  &:first-child:not(:last-child) {
  //把需要修改的同边圆角属性放在一个函数里通过变量设置
    .border-top-radius(@btn-border-radius-base);
    .border-bottom-radius(0);
  }
  &:last-child:not(:first-child) {
    .border-top-radius(0);
    .border-bottom-radius(@btn-border-radius-base);
  }
}
.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {
  border-radius: 0;
}
.btn-group-vertical > .btn-group:first-child:not(:last-child) {
  > .btn:last-child,
  > .dropdown-toggle {
    .border-bottom-radius(0);
  }
}
.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {
  .border-top-radius(0);
}


// Justified button groups
// ----------------------

.btn-group-justified {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  > .btn,
  > .btn-group {
    float: none;
    display: table-cell;
    width: 1%;
  }
  > .btn-group .btn {
    width: 100%;
  }

  > .btn-group .dropdown-menu {
    left: auto;
  }
}


// Checkbox and radio options
//
// In order to support the browser's form validation feedback, powered by the
// `required` attribute, we have to "hide" the inputs via `clip`. We cannot use
// `display: none;` or `visibility: hidden;` as that also hides the popover.
// Simply visually hiding the inputs via `opacity` would leave them clickable in
// certain cases which is prevented by using `clip` and `pointer-events`.
// This way, we ensure a DOM element is visible to position the popover from.
//
// See https://github.com/twbs/bootstrap/pull/12794 and
// https://github.com/twbs/bootstrap/pull/14559 for more information.

[data-toggle="buttons"] {
  > .btn,
  > .btn-group > .btn {
    input[type="radio"],
    input[type="checkbox"] {
      position: absolute;
      clip: rect(0,0,0,0);
      pointer-events: none;
    }
  }
}

````
##### 4、progress-bar.less
````less
//
// Progress bars
// --------------------------------------------------


// Bar animations
// -------------------------

// WebKit
//关键帧@-webkit-keyframes：以百分比来规定改变发生的时间，或者通过关键词 "from" 和 "to"，等价于 0% 和 100%。0% 是动画的开始时间，100% 动画的结束时间。
@-webkit-keyframes progress-bar-stripes {
  from  { background-position: 40px 0; }
  to    { background-position: 0 0; }
}

// Spec and IE10+
@keyframes progress-bar-stripes {
  from  { background-position: 40px 0; }
  to    { background-position: 0 0; }
}


// Bar itself
// -------------------------

// Outer container
.progress {
  overflow: hidden;
  height: @line-height-computed;
  margin-bottom: @line-height-computed;
  background-color: @progress-bg;
  border-radius: @progress-border-radius;
  .box-shadow(inset 0 1px 2px rgba(0,0,0,.1));
}

// Bar of progress
.progress-bar {
  float: left;
  width: 0%;
  height: 100%;
  font-size: @font-size-small;
  line-height: @line-height-computed;
  color: @progress-bar-color;
  text-align: center;
  background-color: @progress-bar-bg;
  .box-shadow(inset 0 -1px 0 rgba(0,0,0,.15));
  .transition(width .6s ease);
}

// Striped bars
//
// `.progress-striped .progress-bar` is deprecated as of v3.2.0 in favor of the
// `.progress-bar-striped` class, which you just add to an existing
// `.progress-bar`.
.progress-striped .progress-bar,
.progress-bar-striped {
  #gradient > .striped();
  background-size: 40px 40px;
}

// Call animation for the active one
//
// `.progress.active .progress-bar` is deprecated as of v3.2.0 in favor of the
// `.progress-bar.active` approach.
.progress.active .progress-bar,
.progress-bar.active {
  .animation(progress-bar-stripes 2s linear infinite);
}


// Variations
// -------------------------

.progress-bar-success {
  .progress-bar-variant(@progress-bar-success-bg);
}

.progress-bar-info {
  .progress-bar-variant(@progress-bar-info-bg);
}

.progress-bar-warning {
  .progress-bar-variant(@progress-bar-warning-bg);
}

.progress-bar-danger {
  .progress-bar-variant(@progress-bar-danger-bg);
}
.progress-bar-variant(@color) {
  background-color: @color;

  // Deprecated parent class requirement as of v3.2.0
  .progress-striped & {
    #gradient > .striped();
  }
}

````
````less
/*
css3过渡 ie9以上
transition-property: none|all|property;
transition-duration: time;
transition-timing-function: linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier(n,n,n,n);
linear	规定以相同速度开始至结束的过渡效果（等于 cubic-bezier(0,0,1,1)）。
ease	规定慢速开始，然后变快，然后慢速结束的过渡效果（cubic-bezier(0.25,0.1,0.25,1)）。
ease-in	规定以慢速开始的过渡效果（等于 cubic-bezier(0.42,0,1,1)）。
ease-out	规定以慢速结束的过渡效果（等于 cubic-bezier(0,0,0.58,1)）。
ease-in-out	规定以慢速开始和结束的过渡效果（等于 cubic-bezier(0.42,0,0.58,1)）。
cubic-bezier(n,n,n,n)	在 cubic-bezier 函数中定义自己的值。可能的值是 0 至 1 之间的数值。
transition-delay: time;
*/
.transition(@transition) {
  -webkit-transition: @transition;
       -o-transition: @transition;
          transition: @transition;
}
/*
css3线性渐变
background: linear-gradient(direction, color-stop1, color-stop2, ...);
*/
.striped(@color: rgba(255,255,255,.15); @angle: 45deg) {
    background-image: -webkit-linear-gradient(@angle, @color 25%, transparent 25%, transparent 50%, @color 50%, @color 75%, transparent 75%, transparent);
    background-image: -o-linear-gradient(@angle, @color 25%, transparent 25%, transparent 50%, @color 50%, @color 75%, transparent 75%, transparent);
    background-image: linear-gradient(@angle, @color 25%, transparent 25%, transparent 50%, @color 50%, @color 75%, transparent 75%, transparent);
}
/*
css3径向渐变 ie9以上
background: radial-gradient(shape size at position, start-color, ..., last-color);
shape	确定圆的类型:
ellipse (默认): 指定椭圆形的径向渐变。
circle ：指定圆形的径向渐变
size	定义渐变的大小，可能值：
farthest-corner (默认) : 指定径向渐变的半径长度为从圆心到离圆心最远的角
closest-side ：指定径向渐变的半径长度为从圆心到离圆心最近的边
closest-corner ： 指定径向渐变的半径长度为从圆心到离圆心最近的角
farthest-side ：指定径向渐变的半径长度为从圆心到离圆心最远的边
position	定义渐变的位置。可能值：
center（默认）：设置中间为径向渐变圆心的纵坐标值。
top：设置顶部为径向渐变圆心的纵坐标值。
bottom：设置底部为径向渐变圆心的纵坐标值。
start-color, ..., last-color	用于指定渐变的起止颜色。
*/
.radial(@inner-color: #555; @outer-color: #333) {
  background-image: -webkit-radial-gradient(circle, @inner-color, @outer-color);
  background-image: radial-gradient(circle, @inner-color, @outer-color);
  background-repeat: no-repeat;
}
/*
animation: name duration timing-function delay iteration-count direction fill-mode play-state;
animation-name	指定要绑定到选择器的关键帧的名称
animation-duration	动画指定需要多少秒或毫秒完成
animation-timing-function	设置动画将如何完成一个周期
animation-delay	设置动画在启动前的延迟间隔。
animation-iteration-count	定义动画的播放次数。
animation-direction	指定是否应该轮流反向播放动画。
animation-fill-mode	规定当动画不播放时（当动画完成时，或当动画有一个延迟未开始播放时），要应用到元素的样式。
animation-play-state	指定动画是否正在运行或已暂停。
initial	设置属性为其默认值。 阅读关于 initial的介绍。
inherit	从父元素继承属性。 阅读关于 initinherital的介绍。
*/
.animation(@animation) {
  -webkit-animation: @animation;
       -o-animation: @animation;
          animation: @animation;
}
````
##### javaScript插件架构
    （1）HTML布局规则：基于元素自定义属性的布局规则，比如使用类似于data-target的自定义属性等。
    （2）javaScript实现步骤：所有插件都遵循jQuery插件开发的标准步骤，所有的事件都保持了统一标准。
    （3）插件调用方法：所有插件的使用方式都非常类似，可以是HTML声明式，也可以是调用式（JavaScript代码），并且支持多种回调和可选参数。
##### JavaScript实现步骤
    （1）声明立即调用的函数，例如：
````js
+function($) {"use strict";}(jQuery)
````
    （2）定义插件类及相关原型方法，例如：
````js
Alert.prototype.close
````
    （3）在jQuery上定义插件并重设插件构造函数，例如：
````js
$.fn.alert.Constructor=Alert
````
    （4）防冲突处理（noConflict）,例如：
````js
$.fn.alert.noConflict
````
    （5）绑定各种触发事件（data-api）
##### 以下是一些具有代表性的核心js组件  
##### 1、alert.js
````js
+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.7'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector === '#' ? [] : selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

````  