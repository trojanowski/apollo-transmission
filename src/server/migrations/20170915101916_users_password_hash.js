exports.up = async function(knex) {
  await knex.schema.table('users', table => {
    table.string('password_hash');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('users', table => {
    table.dropColumn('password_hash');
  });
};
