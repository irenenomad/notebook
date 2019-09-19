##### 1、编写jquery插件
###### （1）使用jQuery.fn即使用原型链继承,以下是原码
    jQuery.fn=jQuery.prototype={//jquery goes here //}
###### （2）使用$.extend()来增强jquery，基本功能是用于合并对象，以下是例子
    jQuery.extend({
        newStuff: function() {
            console.log("...")
        }
    })
###### （3）jQuery UI Widget Factory
    $.widget('custom.progressbar',{
        options: {
            value: 0
        },
        _create: function() {
            this.options.value = this._constrain(this.options.value);
            this.element.addClass( "progressbar" );
            this.refresh();
        },
        _setOption: function( key, value ) {
            if ( key === "value" ) {
                value = this._constrain( value );
            }
            this._super( key, value );
        },
        _setOptions: function( options ) {
            this._super( options );
            this.refresh();
        },
        refresh: function() {
            var progress = this.options.value + "%";
            this.element.text( progress );
        },
        _constrain: function( value ) {
            if ( value > 100 ) {
                value = 100;
            }
            if ( value < 0 ) {
                value = 0;
            }
            return value;
        }
    })
###### 注意：总是确保$指向jQuery
    (function($) {
        $.fn.newStuff = function() {
            /*相关code*/
        }
    })(jQuery)
    
       