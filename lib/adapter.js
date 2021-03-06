import _ from 'lodash'
import Knex from 'knex'

import PostgresWritableStream from './PostgresWritableStream'

const defaults = {
  debug: false,
  pool: {
    min: 2,
    max: 16
  },
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5432
  },
  fileTable: 'file'
}

class SkipperPostgreSQLAdapter {

  constructor (options = { }) {
    this.options = _.defaultsDeep({ }, options, defaults)

    this.registerConnection()
  }

  registerConnection () {
    this.knex = Knex({
      client: 'pg',
      connection: this.options.connection,
      pool: this.options.pool,
      debug: process.env.WATERLINE_DEBUG_SQL || this.options.debug
    })

    return this.knex.schema.hasTable(this.options.fileTable)
      .then(exists => {
        if (exists) return

        return this.knex.schema.createTable(this.options.fileTable, table => {
          table.text('fd')
          table.text('dirname')
          table.binary('data')
        })
      })
  }

  teardown () {
    return this.knex.destroy()
  }

  /**
   * Read a file from the upstream system (PostgreSQL)
   *
   * @param fd {FileDescriptor}
   */
  read (options, cb) {
    let fd = _.isObject(options) ? options.fd : options

    return this.knex(this.options.fileTable)
      .select()
      .where({ fd: fd })
      .then(([ file = { }]) => {
        cb(null, file.data)
        return file.data
      })
      .catch(cb)
  }

  /**
   * Remove a file from the upstream system
   *
   * @param fd {FileDescriptor}
   */
  rm (fd, cb) {
    return this.knex(this.options.fileTable)
      .where({ fd: fd })
      .delete()
      .then(() => {
        cb()
      })
      .catch(cb)
  }

  /**
   * Get the contents of a particular directory on the upstream system
   *
   * @param dirname {FileDescriptor.dirname}
   */
  ls (dirname, cb) {
    return this.knex(this.options.fileTable)
      .select([ 'fd', 'dirname' ])
      .where({ dirname: dirname })
      .then((files = [ ]) => {
        cb(null, files)
        return files
      })
      .catch(cb)
  }

  /**
   * Return an "upstream receiver" which will receive files from a stream and
   * pipe them to the upstream system.
   *
   * @return {stream.Writable}
   */
  receive (options = { }) {
    return new PostgresWritableStream(options, this)
  }
}

export default function (options) {
  return new SkipperPostgreSQLAdapter(options)
}
