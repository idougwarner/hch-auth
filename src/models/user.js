import { Table } from '../db/common';
import BaseModel from './base';
import jsonSchema from './json-schemas/user.schema';

class User extends BaseModel {
  static get tableName() {
    return Table.USER;
  }

  static get jsonSchema() {
    return jsonSchema;
  }
}

export default User;
