import { Writable } from 'stream'
import path from 'path'
import _ from 'lodash'

export default class PostgresWritableStream extends Writable {

  /**
   * @override
   * https://nodejs.org/api/stream.html#stream_new_stream_writable_options
   */
  constructor (streamOptions, adapter) {
    super(_.defaults({ objectMode: true }, streamOptions))
    this.Adapter = adapter
  }

  /**
   * @override
   * https://nodejs.org/api/stream.html#stream_class_stream_writable_1
   *
   * @param file {Buffer}
   * @param encoding {null}
   * @param cb {Function}
   */
  _write (file, encoding, cb) {
    file.once('error', err => {
      console.error(err)
      cb(err)
    })

    if (!file.byteCount) {
      file.byteCount = file._readableState.length
    }

    return this.Adapter.knex(this.Adapter.options.fileTable)
      .insert({
        data: file._readableState.buffer[0],
        fd: file.fd,
        dirname: file.dirname || path.dirname(file.fd),
      })
      .returning([ 'fd', 'dirname' ])
      .then(newFile => {
        this.end()
        cb()
      })
      .catch(err => {
        this.emit('error', err)
        this.end()
        cb()
      })
  }
}
