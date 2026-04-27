import { sequelize } from './db.js';
import { app } from './app.js';

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(3000, () => {
    console.log(
      'Server running on http://localhost:3000',
    );
  });
};

start();
