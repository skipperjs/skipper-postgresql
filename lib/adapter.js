import _ from 'lodash'
import Knex from 'knex'

import PostgresWritableStream from './PostgresWritableStream'

const defaults = {
  debug: false,
  pool: {
    min: 10,
    max: 30
  },
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'skippertest',
    port: 5432
  },
  fileTable: 'file',
  fileDescriptorTable: 'filedescriptor'
}

class SkipperPostgreSQLAdapter {

  constructor (options = { }) {
    this.options = _.defaults({ }, options, defaults)

    this.knex = Knex({
      client: 'pg',
      connection: this.options.connection,
      pool: this.options.pool,
      debug: process.env.WATERLINE_DEBUG_SQL || this.options.debug
    })

    this.setupSchema()
  }

  setupSchema () {
    let options = this.options
    return Promise.all([
      this.knex.schema.hasTable(options.fileTable)
      .then(exists => {
        if (exists) return

        return this.knex.schema.createTable(options.fileTable, table => {
          table.text('fd')
          table.binary('data')
        })
      }),
      this.knex.schema.hasTable(options.fileDescriptorTable)
      .then(exists => {
        if (exists) return

        return this.knex.schema.createTable(options.fileDescriptorTable, table => {
          table.text('id')
          table.text('dirname')
          table.text('filename')
          table.text('name')
          table.text('type')
          table.integer('size')
        })
      })
    ])
  }

  /**
   * Read a file from the upstream system (PostgreSQL)
   *
   * @param fd {FileDescriptor}
   */
  read (options, cb) {
    return this.knex(this.options.fileTable)
      .select()
      .where({ fd: options.id })
      .then(([ file ]) => {
        //console.log(file.data)
        console.log('file.data', file.data)
        cb(null, new Buffer(file.data, 'utf8'))
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
        this.knex(this.options.fileDescriptorTable)
          .where({ id: fd })
          .delete()
      })
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
    return this.knex(this.options.fileDescriptorTable)
      .select()
      .where({ dirname: dirname })
      .then(dir => {
        cb(null, dir)
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
