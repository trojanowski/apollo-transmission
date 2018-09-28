exports.up = async function(knex) {
  await knex.schema.createTable('messages', table => {
    table.bigIncrements();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .bigInteger('sender_id')
      .notNullable()
      .references('users.id');
    table
      .bigInteger('recipient_id')
      .notNullable()
      .references('users.id');
    table.text('body').notNullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('messages');
};
