// Scripts/seedManager.js
const bcrypt = require('bcrypt');
const Manager = require('../Schemas/Manager');

const seedManager = async () => {
  try {
    const email = process.env.DEFAULT_MANAGER_EMAIL;
    const plainPassword = process.env.DEFAULT_MANAGER_PASSWORD;

    if (!email || !plainPassword) {
      console.error("Manager email or password not set in environment variables.");
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const existing = await Manager.findOne({ email });

    if (existing) {
      if (await bcrypt.compare(plainPassword, existing.password)) {
        console.log("Password is the same, skip updating.");
        return;
      }
        // Update password if manager exists and pass is different
        existing.password = hashedPassword;
        await existing.save();
        console.log("Manager password updated.");
        return;
      }

      await Manager.create({ email, password: hashedPassword });
      console.log("Default manager created.");
    } catch (err) {
      console.error("Error in seedManager:", err);
    }
  };

  module.exports = seedManager;
