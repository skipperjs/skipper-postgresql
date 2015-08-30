import _ from 'lodash'
import Knex from 'knex'

import PostgresWritableStream from './PostgresWritableStream'

class SkipperPostgreSQLAdapter {

  constructor (options = { }) {
    this.options = options;

    this.knex = Knex({
      client: 'pg',
      connection: options.connection,
      pool: options.pool,
      debug: process.env.WATERLINE_DEBUG_SQL || options.debug
    })
  }

  /**
   * Read a file from the upstream system (PostgreSQL)
   *
   * @param fd {FileDescriptor}
   */
  read (fd, cb) {
    return this.knex
      .select()
      .from(this.options.fileTable || 'file')
      .where({ fd: fd })
      .then(([ file ]) => {
        cb(null, file.data)
      })
      .catch(cb)
  }

  /**
   * Remove a file from the upstream system
   *
   * @param fd {FileDescriptor}
   */
  rm (fd, cb) {
    return this.knex(this.options.fileTable || 'file')
      .where({ fd: fd })
      .delete()
      .then(result => cb())
      .catch(cb)
  }

  /**
   * Get the contents of a particular directory on the upstream system
   *
   * @param dirname {FileDescriptor.dirname}
   */
  ls (dirname, cb) {
    return this.knex
      .select()
      .from(this.options.fileDescriptorTable || 'filedescriptor')
      .where({ dirname: dirname })
      .then(dir => cb(null, descriptors))
      .catch(cb)
  }

  /**
   * Return an "upstream receiver" which will receive files from a stream and
   * pipe them to the upstream system.
   *
   * @return {stream.Writable}
   */
  receive (options = { }) {
    this.options = options

    return new PostgresWritableStream(options)
  }
}

export default function (options) {
  return new SkipperPostgreSQLAdapter(options, knex)
}
