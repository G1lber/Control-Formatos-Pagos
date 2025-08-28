import { Model } from "objection";

class ResetCode extends Model {
  static get tableName() {
    return "reset_codes";
  }
}

export default ResetCode;
