# read-torrent

Read and parse a torrent from a resource

	npm install read-torrent

## Usage

``` js
var readTorrent = require('read-torrent');

readTorrent('http://my-server.com/file.torrent', options, function(err, torrent) {
	// we loaded a torrent from a server
});

readTorrent('mydir/file.torrent', function(err, torrent) {
	// we loaded a torrent from a file
});
```
where `options` is a javascript object with [request](https://www.npmjs.com/package/request) options

The torrent result looks like this:

``` js
{
  infoHash: 'd2474e86c95b19b8bcfdb92bc12c9d44667cfa36',
  name: 'Leaves of Grass by Walt Whitman.epub',
  private: false,
  created: new Date('Thu Aug 01 2013 06:27:46 GMT-0700 (PDT)'),
  announce: [
    'http://tracker.thepiratebay.org/announce',
    'udp://tracker.openbittorrent.com:80',
    'udp://tracker.ccc.de:80',
    'udp://tracker.publicbt.com:80',
    'udp://fr33domtracker.h33t.com:3310/announce'
  ],
  files: [
    {
      path: 'Leaves of Grass by Walt Whitman.epub',
      name: 'Leaves of Grass by Walt Whitman.epub',
      length: 362017,
      offset: 0
    }
  ],
  length: 362017,
  pieceLength: 16384,
  lastPieceLength: 1569,
  pieces: [
    '1f9c3f59beec079715ec53324bde8569e4a0b4eb',
    'ec42307d4ce5557b5d3964c5ef55d354cf4a6ecc',
    '7bf1bcaf79d11fa5e0be06593c8faafc0c2ba2cf',
    '76d71c5b01526b23007f9e9929beafc5151e6511',
    '0931a1b44c21bf1e68b9138f90495e690dbc55f5',
    '72e4c2944cbacf26e6b3ae8a7229d88aafa05f61',
    'eaae6abf3f07cb6db9677cc6aded4dd3985e4586',
    '27567fa7639f065f71b18954304aca6366729e0b',
    '4773d77ae80caa96a524804dfe4b9bd3deaef999',
    'c9dd51027467519d5eb2561ae2cc01467de5f643',
    '0a60bcba24797692efa8770d23df0a830d91cb35',
    'b3407a88baa0590dc8c9aa6a120f274367dcd867',
    'e88e8338c572a06e3c801b29f519df532b3e76f6',
    '70cf6aee53107f3d39378483f69cf80fa568b1ea',
    'c53b506159e988d8bc16922d125d77d803d652c3',
    'ca3070c16eed9172ab506d20e522ea3f1ab674b3',
    'f923d76fe8f44ff32e372c3b376564c6fb5f0dbe',
    '52164f03629fd1322636babb2c014b7dae582da4',
    '1363965261e6ce12b43701f0a8c9ed1520a70eba',
    '004400a267765f6d3dd5c7beb5bd3c75f3df2a54',
    '560a61801147fa4ec7cf568e703acb04e5610a4d',
    '56dcc242d03293e9446cf5e457d8eb3d9588fd90',
    'c698de9b0dad92980906c026d8c1408fa08fe4ec'
  ]
}
```

For convenience, `read-torrent` also support reading magnet uri. Resulting information is limited, though.

``` js
// "Leaves of Grass" by Walt Whitman
var uri = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A6969&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337'

readTorrent(uri, function(err, torrent) {
  // we loaded a torrent from a magnet uri
});
```

Resulting information depends on the contents of the URI, but `infoHash` is guaranteed for any valid magnet uri.

## Command-line interface

There is also a command-line interface available if you install it with `-g`

	npm install -g read-torrent

This installs a program called `read-torrent` that you simply pass a torrent file or url

	read-torrent http://my-server.com/file.torrent

This will print all meta info of the torrent file to the terminal

## Comments

Thanks to https://github.com/feross for `parse-torrent` and `magnet-uri`
