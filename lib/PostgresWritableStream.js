import { Writable } from 'stream'
import path from 'path'

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

    console.log('file', file._readableState.buffer[0])

    return this.Adapter.knex(this.Adapter.options.fileTable)
      .insert({ data: file._readableState.buffer[0], fd: file.fd })
      .returning('*')
      .then(([ newFile ]) => {
        return this.Adapter.knex(this.Adapter.options.fileDescriptorTable)
          .insert({
            id: newFile.fd,
            name: file.name,
            filename: newFile.fd,
            size: file.byteCount,
            dirname: file.dirname || path.dirname(file.fd)
          })
          .returning('*')
      })
      .then(fd => {
        this.emit('finish', null, fd, fd)
        cb()
      })
      .catch(err => {
        this.emit('error', err)
        cb()
      })
  }
}
