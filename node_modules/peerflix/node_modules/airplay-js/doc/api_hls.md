HLS Server
=================

HTTP Live Streaming Server for Apple TV


## API

### constructor( [options, callback] )

构造函数

+ `option`: `Object`
	
	- `streaming`: `boolean`, 是否直播模式, **暂时不支持此参数**
	- `cache`: `boolean`, 是否支持`TS`文件缓存
	- `duration`: `number`, `TS`分片时长(s)
	- `lib`: `string`, `ffmpeg`库目录
	- `out`:`string`, `TS`分片输出目录


### start( port )

启动 HLS Server


### stop()

停止 HLS Server


### open( fileFullPath[, callback] )

选择`本地`播放视频文件

+ fileFullPath: 本地视频文件
+ callback: 回调函数, 参数 `info`, Object, 选择的视频信息对象


### getURI( type[, index] )

获取各种路径:

+ `type`: `String`

	- 其他(默认): 直播流完整路径，如: `http://192.168.1.7:7001/stream/`
	- `playlist`: `m3u8`播放列表文件路径，目前固定为: `/stream/0.m3u8`
	- `segment`: `TS`分片文件路径，目前固定为: `/stream/0/%d.ts` 形式


## Event

### start

	function ( serverInfo ) {}

服务启动后触发

`serverInfo`: `Object`
	
+ `host`: 本机IP
+ `port`: 服务端口



### stop

	function () {}

服务停止后触发



### request

	function ( request ) {}

服务被访问时触发

`request`: `http.ClientRequest`



### process

	function ( data ) {}

`TS`分片转换时触发

`data`: `Object`

+ `index`: `TS`分片索引
+ `file`: `TS`分片文件路径
+ `out`: 线程输出数据



### segment

	function ( data ) {}

`TS`分片转换完成后触发

`data`: `Object`

+ `index`: `TS`分片索引
+ `file`: `TS`分片文件路径
+ `out`: 线程输出数据


### stream

	function ( index, size ) {}

`TS`分片被访问请求时触发

+ `index`: 当前被请求`TS`分片索引
+ `size`: `TS`分片总数



### error

	function ( err ) {}

服务发生错误时触发

`err`: `Object`

+ `type`: `Sring`, 错误类型，通常值代表正在执行的方法名
+ `..`: `*`, 根据`type`值不同，附加参数会不同，详细看代码吧不写了~~
