import { Model, Sequelize, STRING, UUID } from "sequelize";
import * as uuid from "uuid";

class User extends Model {
  public id!: string;
  public name!: string;
}

async function updateUser(userId: string): Promise<void> {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error();
  }

  await user.update({ name: "baz" });
}

async function main() {
  const sequelize = new Sequelize("postgres://postgres@localhost/sequelize");

  User.init(
    {
      id: {
        defaultValue: () => uuid.v4(),
        primaryKey: true,
        type: UUID
      },
      name: {
        allowNull: false,
        type: STRING
      }
    },
    { sequelize, version: true }
  );

  await User.sync({ force: true });

  // Test a connection.
  await sequelize.authenticate();
  const { id: userId } = await User.create({ name: "foo" });

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      throw new Error();
    }

    await updateUser(userId);

    await user.update({ name: "bar" }, { transaction });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  await transaction.commit();

  await sequelize.close();
}

main().catch(error => {
  // tslint:disable-next-line:no-console
  console.error(error);
  process.exit(1);
});
