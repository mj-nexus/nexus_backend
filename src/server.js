const dotenv = require("dotenv");
const sequelize = require("./config/db");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
