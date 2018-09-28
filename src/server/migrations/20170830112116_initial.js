exports.up = async function(knex) {
  await knex.schema.createTable('users', table => {
    table.bigIncrements();
    table.timestamps(false, true);
    table
      .string('username')
      .unique()
      .notNullable();
    table
      .string('email')
      .unique()
      .notNullable();
  });

  await knex.schema.createTable('posts', table => {
    table.bigIncrements();
    table.timestamps(false, true);
    table
      .bigInteger('author_id')
      .notNullable()
      .references('users.id');
    table.text('body').notNullable();

    table.index(['author_id', knex.raw('id DESC')], 'posts_author_id_id_desc');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('posts');
  await knex.schema.dropTable('users');
};
