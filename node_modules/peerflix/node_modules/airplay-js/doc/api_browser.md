Browser Server
=================

Service Discovery Server for Apple TV


## API

### constructor( [options] )

构造函数

+ `option`: `Object`, 参考`mdns`的`options`


### start( port )

启动 Browser


### stop()

停止 Browser


### isValid( info )

检测是否为有效的`AppleTV`设备

+ `info`: `Object`

**注: 默认只选择 `networkInterface` 匹配 `/^en\d+$/` 的设备**


### getDevice( info )

根据`info`获取匹配的`AppleTV`设备

+ `info`: `Object`



### getDeviceById( deviceId[, skipCheck] )

根据`deviceId`获取对应的`AppleTV`设备

+ `deviceId`: `number`, `Device`的`id`属性值
+ `skipCheck`: `boolean`, 是否跳过状态检测(`true`时结果可能包含还未`ready`的设备)



### getDevices( [skipCheck] )

获取所有已发现并解析过的`AppleTV`设备

`skipCheck`: `boolean`, 是否跳过状态检测(`true`时结果可能包含还未`ready`的设备)



## Event

### start

	function () {}

服务启动后触发



### stop

	function () {}

服务停止后触发


### deviceOn

	function ( device ) {}

`AppleTV`设备上线时触发

`device`: `Device`类实例


### deviceOff

	function ( device ) {}

`AppleTV`设备下线时触发

`device`: `Device`类实例


### error

	function ( err ) {}

服务发生错误时触发

`err`: `Object`

+ `type`: `Sring`, 错误类型，通常值代表正在执行的方法名
+ `..`: `*`, 根据`type`值不同，附加参数会不同，详细看代码吧不写了~~
