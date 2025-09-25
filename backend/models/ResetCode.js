const { Model } = require("objection");

class ResetCode extends Model {
  static get tableName() { return "reset_codes"; }
}

module.exports = ResetCode;