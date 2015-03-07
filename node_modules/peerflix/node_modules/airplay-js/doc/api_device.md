Device
=================

AirPlay Protocol Device for Apple TV


## API

### constructor( id, info[, callback] )

构造函数

+ `id`: `number`, 自动分配的设备ID
+ `info`: `Object`, 设备的ServerInfo
+ `callback`: `Function`, 回调函数, `ready`事件调用时触发


### isReady()

设备是否解析完成且连接成功


### close()

断开设备的连接



### match( info )

根据`info`检测对比当前设备是否同一设备

+ `info`: `Object`



### getInfo()

获取当前设备的详细信息




### status( [callback] )

获取当前播放状态

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### play( src[, position, callback] )

播放视频

+ `src`: `string`, HLS直播流地址(即 `hls.getURI()` 的返回值)
+ `position`: `number`, 播放的开始时间点
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### stop( [callback] )

结束播放

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### rate( value[, callback] )

恢复或暂停播放

+ `value`: `number`, 有效值: `0` 或 `1`, `貌似大多数视频仅支持0和1`
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### scrub( position[, callback] )

seek视频

+ `position`: `number`, seek 位置
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### volume( value[, callback] )

调整音量. **貌似不支持**

+ `value`: `number`
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### reverse( [callback] )

重放视频. **貌似不支持**

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`

### photo( [callback] )

播放图片. **TODO**

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### authorize( [callback] )

认证. **TODO**

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### slideshowFeatures( [callback] )

相册播放. **TODO**

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`







## Event

### ready

	function ( device ) {}

设备解析完成并连接成功时触发

+ `device`: `Device`实例


### ping

	function () {}

每次心跳检测返回时触发


### close

	function () {}

设备下线连接断开



### error

	function ( err ) {}

服务发生错误时触发

`err`: `Object`

+ `type`: `Sring`, 错误类型，通常值代表正在执行的方法名
+ `..`: `*`, 根据`type`值不同，附加参数会不同，详细看代码吧不写了~~
