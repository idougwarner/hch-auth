import { Model } from 'objection';
import knex from '../db/knex';

Model.knex(knex);

class BaseModel extends Model {
  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

export default BaseModel;
