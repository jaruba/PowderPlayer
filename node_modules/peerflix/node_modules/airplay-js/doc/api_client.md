Client
=================

AirPlay Protocol Client for Apple TV


## API

### constructor( [options, callback] )

构造函数

+ `option`: `Object`, 参考`net.createConnection`的`options`
+ `callback`: `Function`, `AppleTV`设备连接成功时调用


### ping()

`AirPlay设备`心跳检测，防`60s超时`断开


### close()

断开`AirPlay设备`的连接



### request( req[, body, callback] )

向`AirPlay`发送请求

+ `req`: `Object`, 请求配置
	- `headers`: `Object`, 请求头
	- `method`: `string`, 请求类型, `GET` || `POST`
+ `body`: `string`, 附加数据，紧在`req.method`为`POST`时有效
+ `callback`: `Function`, 回调函数
	- `res`: `Object`, 由`parseResponse`解析后的对象
		+ `statusCode`: `number`,
       + `statusReason`: `string`,
       + `headers`: `Object`
       + `body`: `string`



### get( path[, callback] )

获取各种路径:

+ `path`: `string`, 请求路径
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`



### post( path[, body, callback] )

获取各种路径:

+ `path`: `string`, 请求路径
+ `body`: `string`, 附加数据
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`



### serverInfo( [callback] )

获取`ApppleTV`的Server信息

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### playbackInfo( [callback] )

获取`ApppleTV`的当前播放状态

+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### play( src[, position, callback] )

通知`ApppleTV`播放视频

+ `src`: `string`, HLS直播流地址(即 `hls.getURI()` 的返回值)
+ `position`: `number`, 播放的开始时间点
+ `callback`: `Function`, 回调函数, 参考`request`的`callback`


### stop( [callback] )

通知`ApppleTV`结束播放

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

### ping

	function () {}

每次心跳检测返回时触发



### error

	function ( err ) {}

服务发生错误时触发

`err`: `Object`

+ `type`: `Sring`, 错误类型，通常值代表正在执行的方法名
+ `..`: `*`, 根据`type`值不同，附加参数会不同，详细看代码吧不写了~~
