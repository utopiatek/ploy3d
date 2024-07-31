declare var Deflate_1: typeof Deflate$1;
declare var Inflate_1: typeof Inflate$1;
declare namespace constants_1 {
    let Z_NO_FLUSH: number;
    let Z_PARTIAL_FLUSH: number;
    let Z_SYNC_FLUSH: number;
    let Z_FULL_FLUSH: number;
    let Z_FINISH: number;
    let Z_BLOCK: number;
    let Z_TREES: number;
    let Z_OK: number;
    let Z_STREAM_END: number;
    let Z_NEED_DICT: number;
    let Z_ERRNO: number;
    let Z_STREAM_ERROR: number;
    let Z_DATA_ERROR: number;
    let Z_MEM_ERROR: number;
    let Z_BUF_ERROR: number;
    let Z_NO_COMPRESSION: number;
    let Z_BEST_SPEED: number;
    let Z_BEST_COMPRESSION: number;
    let Z_DEFAULT_COMPRESSION: number;
    let Z_FILTERED: number;
    let Z_HUFFMAN_ONLY: number;
    let Z_RLE: number;
    let Z_FIXED: number;
    let Z_DEFAULT_STRATEGY: number;
    let Z_BINARY: number;
    let Z_TEXT: number;
    let Z_UNKNOWN: number;
    let Z_DEFLATED: number;
}
declare namespace pako {
    export { Deflate_1 as Deflate };
    export { deflate_1 as deflate };
    export { deflateRaw_1 as deflateRaw };
    export { gzip_1 as gzip };
    export { Inflate_1 as Inflate };
    export { inflate_1 as inflate };
    export { inflateRaw_1 as inflateRaw };
    export { ungzip_1 as ungzip };
    export { constants_1 as constants };
}
/**
 * deflate(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
declare function deflate_1(input: any, options: any): Uint8Array;
/**
 * deflateRaw(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
declare function deflateRaw_1(input: any, options: any): Uint8Array;
/**
 * gzip(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
declare function gzip_1(input: any, options: any): Uint8Array;
/**
 * inflate(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako');
 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
 * let output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 **/
declare function inflate_1(input: any, options: any): string | Uint8Array;
/**
 * inflateRaw(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
declare function inflateRaw_1(input: any, options: any): string | Uint8Array;
/**
 * inflate(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako');
 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
 * let output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 **/
declare function ungzip_1(input: any, options: any): string | Uint8Array;
/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/
/**
 * Deflate.result -> Uint8Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/
/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/
/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/
/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
declare function Deflate$1(options: any): void;
declare class Deflate$1 {
    /**
     * class Deflate
     *
     * Generic JS-style wrapper for zlib calls. If you don't need
     * streaming behaviour - use more simple functions: [[deflate]],
     * [[deflateRaw]] and [[gzip]].
     **/
    /**
     * Deflate.result -> Uint8Array
     *
     * Compressed result, generated by default [[Deflate#onData]]
     * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
     * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
     **/
    /**
     * Deflate.err -> Number
     *
     * Error code after deflate finished. 0 (Z_OK) on success.
     * You will not need it in real life, because deflate errors
     * are possible only on wrong options or bad `onData` / `onEnd`
     * custom handlers.
     **/
    /**
     * Deflate.msg -> String
     *
     * Error message, if [[Deflate.err]] != 0
     **/
    /**
     * new Deflate(options)
     * - options (Object): zlib deflate options.
     *
     * Creates new deflator instance with specified params. Throws exception
     * on bad params. Supported options:
     *
     * - `level`
     * - `windowBits`
     * - `memLevel`
     * - `strategy`
     * - `dictionary`
     *
     * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
     * for more information on these.
     *
     * Additional options, for internal needs:
     *
     * - `chunkSize` - size of generated data chunks (16K by default)
     * - `raw` (Boolean) - do raw deflate
     * - `gzip` (Boolean) - create gzip wrapper
     * - `header` (Object) - custom header for gzip
     *   - `text` (Boolean) - true if compressed data believed to be text
     *   - `time` (Number) - modification time, unix timestamp
     *   - `os` (Number) - operation system code
     *   - `extra` (Array) - array of bytes with extra data (max 65536)
     *   - `name` (String) - file name (binary string)
     *   - `comment` (String) - comment (binary string)
     *   - `hcrc` (Boolean) - true if header crc should be added
     *
     * ##### Example:
     *
     * ```javascript
     * const pako = require('pako')
     *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
     *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
     *
     * const deflate = new pako.Deflate({ level: 3});
     *
     * deflate.push(chunk1, false);
     * deflate.push(chunk2, true);  // true -> last chunk
     *
     * if (deflate.err) { throw new Error(deflate.err); }
     *
     * console.log(deflate.result);
     * ```
     **/
    constructor(options: any);
    options: any;
    err: number;
    msg: string;
    ended: boolean;
    chunks: any[];
    strm: ZStream;
    _dict_set: boolean;
    /**
     * Deflate#push(data[, flush_mode]) -> Boolean
     * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
     *   converted to utf8 byte sequence.
     * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
     *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
     *
     * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
     * new compressed chunks. Returns `true` on success. The last data block must
     * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
     * buffers and call [[Deflate#onEnd]].
     *
     * On fail call [[Deflate#onEnd]] with error code and return false.
     *
     * ##### Example
     *
     * ```javascript
     * push(chunk, false); // push one of data chunks
     * ...
     * push(chunk, true);  // push last chunk
     * ```
     **/
    push(data: any, flush_mode: any): boolean;
    /**
     * Deflate#onData(chunk) -> Void
     * - chunk (Uint8Array): output data.
     *
     * By default, stores data blocks in `chunks[]` property and glue
     * those in `onEnd`. Override this handler, if you need another behaviour.
     **/
    onData(chunk: any): void;
    /**
     * Deflate#onEnd(status) -> Void
     * - status (Number): deflate status. 0 (Z_OK) on success,
     *   other if not.
     *
     * Called once after you tell deflate that the input stream is
     * complete (Z_FINISH). By default - join collected chunks,
     * free memory and fill `results` / `err` properties.
     **/
    onEnd(status: any): void;
    result: Uint8Array;
}
/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/
/**
 * Inflate.result -> Uint8Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/
/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/
/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/
/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
declare function Inflate$1(options: any): void;
declare class Inflate$1 {
    /**
     * class Inflate
     *
     * Generic JS-style wrapper for zlib calls. If you don't need
     * streaming behaviour - use more simple functions: [[inflate]]
     * and [[inflateRaw]].
     **/
    /**
     * Inflate.result -> Uint8Array|String
     *
     * Uncompressed result, generated by default [[Inflate#onData]]
     * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
     * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
     **/
    /**
     * Inflate.err -> Number
     *
     * Error code after inflate finished. 0 (Z_OK) on success.
     * Should be checked if broken data possible.
     **/
    /**
     * Inflate.msg -> String
     *
     * Error message, if [[Inflate.err]] != 0
     **/
    /**
     * new Inflate(options)
     * - options (Object): zlib inflate options.
     *
     * Creates new inflator instance with specified params. Throws exception
     * on bad params. Supported options:
     *
     * - `windowBits`
     * - `dictionary`
     *
     * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
     * for more information on these.
     *
     * Additional options, for internal needs:
     *
     * - `chunkSize` - size of generated data chunks (16K by default)
     * - `raw` (Boolean) - do raw inflate
     * - `to` (String) - if equal to 'string', then result will be converted
     *   from utf8 to utf16 (javascript) string. When string output requested,
     *   chunk length can differ from `chunkSize`, depending on content.
     *
     * By default, when no options set, autodetect deflate/gzip data format via
     * wrapper header.
     *
     * ##### Example:
     *
     * ```javascript
     * const pako = require('pako')
     * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
     * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
     *
     * const inflate = new pako.Inflate({ level: 3});
     *
     * inflate.push(chunk1, false);
     * inflate.push(chunk2, true);  // true -> last chunk
     *
     * if (inflate.err) { throw new Error(inflate.err); }
     *
     * console.log(inflate.result);
     * ```
     **/
    constructor(options: any);
    options: any;
    err: number;
    msg: string;
    ended: boolean;
    chunks: any[];
    strm: ZStream;
    header: GZheader;
    /**
     * Inflate#push(data[, flush_mode]) -> Boolean
     * - data (Uint8Array|ArrayBuffer): input data
     * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
     *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
     *   `true` means Z_FINISH.
     *
     * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
     * new output chunks. Returns `true` on success. If end of stream detected,
     * [[Inflate#onEnd]] will be called.
     *
     * `flush_mode` is not needed for normal operation, because end of stream
     * detected automatically. You may try to use it for advanced things, but
     * this functionality was not tested.
     *
     * On fail call [[Inflate#onEnd]] with error code and return false.
     *
     * ##### Example
     *
     * ```javascript
     * push(chunk, false); // push one of data chunks
     * ...
     * push(chunk, true);  // push last chunk
     * ```
     **/
    push(data: any, flush_mode: any): boolean;
    /**
     * Inflate#onData(chunk) -> Void
     * - chunk (Uint8Array|String): output data. When string output requested,
     *   each chunk will be string.
     *
     * By default, stores data blocks in `chunks[]` property and glue
     * those in `onEnd`. Override this handler, if you need another behaviour.
     **/
    onData(chunk: any): void;
    /**
     * Inflate#onEnd(status) -> Void
     * - status (Number): inflate status. 0 (Z_OK) on success,
     *   other if not.
     *
     * Called either after you tell inflate that the input stream is
     * complete (Z_FINISH). By default - join collected chunks,
     * free memory and fill `results` / `err` properties.
     **/
    onEnd(status: any): void;
    result: string | Uint8Array;
}
declare function ZStream(): void;
declare class ZStream {
    input: any;
    next_in: number;
    avail_in: number;
    total_in: number;
    output: any;
    next_out: number;
    avail_out: number;
    total_out: number;
    msg: string;
    state: any;
    data_type: number;
    adler: number;
}
declare function GZheader(): void;
declare class GZheader {
    text: number;
    time: number;
    xflags: number;
    os: number;
    extra: any;
    extra_len: number;
    name: string;
    comment: string;
    hcrc: number;
    done: boolean;
}
export { Deflate_1 as Deflate, Inflate_1 as Inflate, constants_1 as constants, pako as default, deflate_1 as deflate, deflateRaw_1 as deflateRaw, gzip_1 as gzip, inflate_1 as inflate, inflateRaw_1 as inflateRaw, ungzip_1 as ungzip };
