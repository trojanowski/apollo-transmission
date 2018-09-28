exports.up = async function(knex) {
  await knex.schema.table('users', table => {
    table.string('fullname');
    table.string('bio');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('users', table => {
    table.dropColumn('fullname');
    table.dropColumn('bio');
  });
};
