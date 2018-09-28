exports.up = async function(knex) {
  await knex.schema.createTable('follows', table => {
    table.bigIncrements();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .bigInteger('follower_id')
      .notNullable()
      .references('users.id');
    table
      .bigInteger('followed_id')
      .notNullable()
      .references('users.id');
    table.unique(['follower_id', 'followed_id']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('follows');
};
