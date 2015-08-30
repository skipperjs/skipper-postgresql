import { Writable } from 'stream'

export default class PostgresWritableStream extends Writable {

  /**
   * @override
   * https://nodejs.org/api/stream.html#stream_new_stream_writable_options
   */
  constructor (options, knex) {
    super({ objectMode: true })
    this.options = options
    this.knex = knex
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
    knex(this.options.fileTable || 'file')
      .insert({ file: file, fd: file.fd })
      .then(result => {
        cb()
      })
      .catch(cb)
  }
}
